import {
  deriveEth2ValidatorKeys,
  deriveKeyFromEntropy,
  deriveKeyFromMnemonic,
} from './bls-keygen';

import * as bls from 'bls-eth-wasm/browser';

if (!global.TextEncoder) {
  global.TextEncoder = require('util').TextEncoder;
}

export interface ValidatorKeys {
  index: number;
  publicKey: string;
  privateKey: string;
}

/**
 * Initialize BLS library if not yet
 */
async function initBLS() {
  if (!bls.deserializeHexStrToSecretKey) {
    await bls.init(bls.BLS12_381);
  }
}

/**
 * Generate validator keys from seed
 * @param seed user seed derived from his mnemonic
 * @param count number of keys to generate
 * @param keysPrefix use 0x prefix for keys if necessary
 */
export async function getValidatorKeysFromSeed(_seed: string | Uint8Array, count: number, keysPrefix = ''): Promise<ValidatorKeys[]> {
  await initBLS();
  const seed = typeof _seed !== 'string' ? _seed : deriveKeyFromEntropy(new Uint8Array(Buffer.from(_seed, 'hex')));
  return Array.from({ length: count }, (_, i) => {
    const { signing } = deriveEth2ValidatorKeys(Buffer.from(seed), i);
    const signingKeyHex = Buffer.from(signing).toString('hex');
    const validator = bls.deserializeHexStrToSecretKey(signingKeyHex);
    return {
      index: i,
      privateKey: `${keysPrefix}${validator.serializeToHexStr()}`,
      publicKey: `${keysPrefix}${validator.getPublicKey().serializeToHexStr()}`,
    };
  });
}

/**
 * Generate validator keys from mnemonic
 * @param mnemonic user mnemonic
 * @param count number of keys to generate
 * @param keysPrefix
 */
export async function getValidatorKeysFromMnemonic(mnemonic: string, count: number, keysPrefix = ''): Promise<ValidatorKeys[]> {
  return getValidatorKeysFromSeed(
    deriveKeyFromMnemonic(mnemonic),
    count,
    keysPrefix,
  );
}
