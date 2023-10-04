const ETH2_COIN_TYPE = 3600;
const BLS12_381_PURPOSE = 12381;
const MAX_INDEX = 4294967296; // 2**32

/**
 * Convert a derivation path to an array of indices,
 * verifying that the path conforms to [EIP-2334](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-2334.md)
 * @param path - derivation path
 * @param coinType - set to null to disable coin type verification
 */
export function pathToIndices(path: string, coinType: number | null = ETH2_COIN_TYPE): number[] {
  // Validate hardened keys
  if (path.includes("'")) {
    throw new Error('Hardened keys not supported');
  }

  // Split and validate components
  const components = path.split('/');
  if (components.length < 5) {
    throw new Error('Path should have at least 5 levels');
  }

  // Validate root
  if (components[0] !== 'm') {
    throw new Error("Root should be 'm'");
  }

  // Remove root and parse indices
  components.shift();
  const indices = components.map(i => +i);

  // Validate indices
  if (indices.some(Number.isNaN)) {
    throw new Error('All levels must be numbers');
  }
  if (!indices.every((i) => i >= 0 && i < MAX_INDEX)) {
    throw new Error(`Indices must be in range [0, ${MAX_INDEX})`);
  }

  // Validate purpose
  if (indices[0] !== BLS12_381_PURPOSE) {
    throw new Error("Purpose should be '12381'");
  }

  // Validate coin type
  if (coinType !== null && indices[1] !== coinType) {
    throw new Error(`Coin type should be '${coinType}'`);
  }

  return indices;
}
