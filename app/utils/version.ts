export const versionRegexp = /(v)?((?<major>\d+)\.)?((?<minor>\d+)\.)?(?<mod>\d+)/mgi;

export const VERSIONS: Record<string, number> = {
  EQUAL: 0,
  GREATER: 1,
  SMALLER: -1
};

/**
 * Compare two provided versions which of them is higher.
 * If they are equal, then 0 returned.
 * If first is greater than second, then 1 returned.
 * If second is greater than first, then -1 returned.
 *
 * @param version1
 * @param version2
 */
export const compareVersions = (version1: string, version2: string): number => {
  const parsedVersions = {
    version1: new RegExp(versionRegexp).exec(version1)?.groups ?? null,
    version2: new RegExp(versionRegexp).exec(version2)?.groups ?? null
  };

  // Major part comparison
  if (!parsedVersions.version1?.major && !parsedVersions.version2?.major) {
    return VERSIONS.EQUAL;
  }
  if (parsedVersions.version1?.major && !parsedVersions.version2?.major) {
    return VERSIONS.GREATER;
  }
  if (!parsedVersions.version1?.major && parsedVersions.version2?.major) {
    return VERSIONS.SMALLER;
  }
  if (parseInt(parsedVersions.version1.major, 10) > parseInt(parsedVersions.version2.major, 10)) {
    return VERSIONS.GREATER;
  }
  if (parseInt(parsedVersions.version1.major, 10) < parseInt(parsedVersions.version2.major, 10)) {
    return VERSIONS.SMALLER;
  }
  if (parseInt(parsedVersions.version1.major, 10) === parseInt(parsedVersions.version2.major, 10)) {
    // Minor part comparison
    if (!parsedVersions.version1?.minor && !parsedVersions.version2?.minor) {
      return VERSIONS.EQUAL;
    }
    if (parsedVersions.version1?.minor && !parsedVersions.version2?.minor) {
      return VERSIONS.GREATER;
    }
    if (!parsedVersions.version1?.minor && parsedVersions.version2?.minor) {
      return VERSIONS.SMALLER;
    }
    if (parseInt(parsedVersions.version1.minor, 10) > parseInt(parsedVersions.version2.minor, 10)) {
      return VERSIONS.GREATER;
    }
    if (parseInt(parsedVersions.version1.minor, 10) < parseInt(parsedVersions.version2.minor, 10)) {
      return VERSIONS.SMALLER;
    }
    if (parseInt(parsedVersions.version1.minor, 10) === parseInt(parsedVersions.version2.minor, 10)) {
      // Mod part comparison
      if (!parsedVersions.version1?.mod && !parsedVersions.version2?.mod) {
        return VERSIONS.EQUAL;
      }
      if (parsedVersions.version1?.mod && !parsedVersions.version2?.mod) {
        return VERSIONS.GREATER;
      }
      if (!parsedVersions.version1?.mod && parsedVersions.version2?.mod) {
        return VERSIONS.SMALLER;
      }
      if (parseInt(parsedVersions.version1.mod, 10) > parseInt(parsedVersions.version2.mod, 10)) {
        return VERSIONS.GREATER;
      }
      if (parseInt(parsedVersions.version1.mod, 10) < parseInt(parsedVersions.version2.mod, 10)) {
        return VERSIONS.SMALLER;
      }
    }
  }
  return VERSIONS.EQUAL;
};

/**
 * Compare two versions and return the greatest one.
 * If they are equal then return first provided.
 *
 * @param version1
 * @param version2
 */
export const getGreaterVersion = (version1: string, version2: string): string => {
  const comparedResult = compareVersions(version1, version2);
  if (comparedResult === VERSIONS.EQUAL) {
    return version1;
  }
  if (comparedResult === VERSIONS.GREATER) {
    return version1;
  }
  return version2;
};

/**
 * Detects if the latest KeyVault version is not the same
 * as highest version stored in validators wallet table
 *
 * @param kvLatestVersion
 * @param kvCurrentVersion
 * @param kvPluginCurrentVersion
 */
export const detectIfWalletNeedsUpdate = (kvLatestVersion: string,
                                          kvCurrentVersion: string,
                                          kvPluginCurrentVersion: string): boolean => {
  return kvLatestVersion !== getGreaterVersion(kvCurrentVersion, kvPluginCurrentVersion);
};
