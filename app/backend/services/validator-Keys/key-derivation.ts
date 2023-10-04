import { hkdf } from '@noble/hashes/hkdf';
import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex, concatBytes, hexToBytes, utf8ToBytes } from '@noble/hashes/utils';

/**
 * Derive a secret key from a BIP39 mnemonic seed and optionally an EIP-2334 path.
 * @param ikm
 * @param salt
 */
function ikmToLamportSK(ikm: Uint8Array, salt: Uint8Array): Uint8Array[] {
  const okm = hkdf(sha256, ikm, salt, new Uint8Array(0), 8160); // 8160 = 255 * 32
  return Array.from({length: 255}, (_, i) => okm.slice(i * 32, (i + 1) * 32));
}

/**
 * Derive a secret key from a BIP39 mnemonic seed and optionally an EIP-2334 path.
 * @param parentSK
 * @param index
 */
function parentSKToLamportPK(parentSK: Uint8Array, index: number): Uint8Array {
  const salt = new Uint8Array(4);
  new DataView(salt.buffer).setUint32(0, index, false);

  const ikm = parentSK;
  const lamport0 = ikmToLamportSK(ikm, salt);
  // eslint-disable-next-line no-bitwise
  const notIkm = Uint8Array.from(ikm.map((value) => ~value));
  const lamport1 = ikmToLamportSK(notIkm, salt);
  const lamportPK = lamport0.concat(lamport1).map((value) => sha256(value));
  return sha256(concatBytes(...lamportPK));
}

/**
 * Derive a secret key from a BIP39 mnemonic seed and optionally an EIP-2334 path.
 * @param ikm
 * @param keyInfo
 */
function hkdfModR(ikm: Uint8Array, keyInfo = new Uint8Array(0)): Uint8Array {
  let salt = utf8ToBytes('BLS-SIG-KEYGEN-SALT-');
  let sk = BigInt(0);
  while (sk === BigInt(0)) {
    salt = sha256(salt);
    const okm = hkdf(
      sha256,
      concatBytes(ikm, new Uint8Array(1)),
      salt,
      concatBytes(keyInfo, Uint8Array.from([0, 48])),
      48
    );
    const okmBN = BigInt(`0x${bytesToHex(okm)}`);
    const r = BigInt('52435875175126190479447740508185965837690552500527637822603658699938581184513');
    sk = okmBN % r;
  }
  return hexToBytes(sk.toString(16).padStart(64, '0'));
}

/**
 * Derive a secret key from a BIP39 mnemonic seed and optionally an EIP-2334 path.
 * @param parentSK
 * @param index
 */
export function deriveChildSK(parentSK: Uint8Array, index: number): Uint8Array {
  if (!(parentSK instanceof Uint8Array) || parentSK.length < 32) {
    throw new Error('parentSK must be a Uint8Array of at least 32 bytes');
  }
  if (!Number.isSafeInteger(index) || index < 0 || index >= 2 ** 32) {
    throw new Error('index must be 0 <= i < 2**32');
  }
  const compressedLamportPK = parentSKToLamportPK(parentSK, index);
  return hkdfModR(compressedLamportPK);
}

/**
 * Derive a secret key from a BIP39 mnemonic seed and optionally an EIP-2334 path.
 * @param ikm
 */
export function deriveMasterSK(ikm: Uint8Array): Uint8Array {
  if (!(ikm instanceof Uint8Array)) {
    throw new Error('ikm must be a Uint8Array');
  }
  if (ikm.length < 32) {
    throw new Error('ikm must be >= 32 bytes');
  }
  return hkdfModR(ikm);
}

/**
 * Derive a secret key from a BIP39 mnemonic seed and optionally an EIP-2334 path.
 * @param parentSK
 * @param indices
 */
export function deriveChildSKMultiple(parentSK: Uint8Array, indices: number[]): Uint8Array {
  let key = parentSK;
  indices.forEach(i => { key = deriveChildSK(key, i); });
  return key;
}
