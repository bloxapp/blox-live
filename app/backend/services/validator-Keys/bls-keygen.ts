import { mnemonicToSeedSync, validateMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
import { concatBytes, randomBytes } from '@noble/hashes/utils';
import { pathToIndices } from './path';
import { deriveChildSKMultiple, deriveMasterSK } from './key-derivation';

/**
 *
 * @param entropy optional additional entropy
 */
export function generateRandomSecretKey(entropy?: Uint8Array): Uint8Array {
  let ikm = randomBytes(32);
  if (entropy) {
    ikm = concatBytes(entropy, ikm);
  }
  return deriveKeyFromEntropy(ikm);
}

/**
 * Derive a secret key from a BIP39 mnemonic seed and optionally an EIP-2334 path.
 * If path is included, the derived key will be the child secret key at that path,
 * otherwise, the derived key will be the master secret key
 */
export function deriveKeyFromMnemonic(mnemonic: string, path?: string): Uint8Array {
  if (!validateMnemonic(mnemonic, wordlist)) {
    throw new Error('invalid mnemonic');
  }
  const ikm = Uint8Array.from(mnemonicToSeedSync(mnemonic));
  return deriveKeyFromEntropy(ikm, path);
}

/**
 * Derive a secret key from entropy and optionally an EIP-2334 path.
 * If path is included, the derived key will be the child secret key at that path,
 * otherwise, the derived key will be the master secret key
 */
export function deriveKeyFromEntropy(entropy: Uint8Array, path?: string): Uint8Array {
  const masterKey = deriveMasterSK(Uint8Array.from(entropy));
  if (path) {
    return deriveKeyFromMaster(masterKey, path);
  }
  return masterKey;
}

/**
 * Derive a child secret key from a master secret key
 * @param masterKey master secret key
 * @param path EIP-2334 path to child
 */
export function deriveKeyFromMaster(masterKey: Uint8Array, path: string): Uint8Array {
  return deriveChildSKMultiple(masterKey, pathToIndices(path));
}

export interface IEth2ValidatorKeys {
  withdrawal: Uint8Array;
  signing: Uint8Array;
}

/**
 * Return Eth2 validator HD paths
 */
export function eth2ValidatorPaths(validatorIndex: number): {
  withdrawal: string;
  signing: string;
} {
  return {
    withdrawal: `m/12381/3600/${validatorIndex}/0`,
    signing: `m/12381/3600/${validatorIndex}/0/0`,
  };
}

/**
 * Derive Eth2 validator secret keys from a single master secret key
 * @param masterKey master secret key
 */
export function deriveEth2ValidatorKeys(masterKey: Uint8Array, validatorIndex: number): IEth2ValidatorKeys {
  const paths = eth2ValidatorPaths(validatorIndex);
  return {
    withdrawal: deriveKeyFromMaster(masterKey, paths.withdrawal),
    signing: deriveKeyFromMaster(masterKey, paths.signing),
  };
}
