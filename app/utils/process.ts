import { PROCESSES } from '~app/components/ProcessRunner/constants';
import { getGreaterVersion, versionRegexp } from '~app/utils/version';

export const getProcessNameForUpdate = (keyVaultLatestVersion: string,
                                        keyVaultCurrentVersion: string,
                                        keyVaultPluginCurrentVersion?: string): string => {
  // Identify which of the version KV or Plugin is greater to to compare with latest
  const currentGreaterVersion = keyVaultPluginCurrentVersion
    ? getGreaterVersion(keyVaultCurrentVersion, keyVaultPluginCurrentVersion)
    : keyVaultCurrentVersion;

  if (currentGreaterVersion === keyVaultLatestVersion) {
    return PROCESSES.REINSTALL;
  }
  const parsedVersions = {
    current: new RegExp(versionRegexp).exec(currentGreaterVersion)?.groups ?? null,
    latest: new RegExp(versionRegexp).exec(keyVaultLatestVersion)?.groups ?? null
  };
  if (!parsedVersions.current?.major || !parsedVersions.latest?.major) {
    return PROCESSES.UPGRADE;
  }
  if (parseInt(parsedVersions.latest.major, 10) > parseInt(parsedVersions.current.major, 10)) {
    return PROCESSES.REINSTALL;
  }
  if (!parsedVersions.current?.minor || !parsedVersions.latest?.minor) {
    return PROCESSES.UPGRADE;
  }
  if (parseInt(parsedVersions.latest.minor, 10) > parseInt(parsedVersions.current.minor, 10)) {
    return PROCESSES.REINSTALL;
  }
  return PROCESSES.UPGRADE;
};
