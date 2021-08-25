import { PROCESSES } from '~app/components/ProcessRunner/constants';

export const getProcessNameForUpdate = (keyVaultCurrentVersion: string, keyVaultLatestVersion: string): string => {
  if (keyVaultCurrentVersion === keyVaultLatestVersion) {
    return PROCESSES.REINSTALL;
  }
  const versionRegexp = /(v)?((?<major>\d+)\.)?((?<minor>\d+)\.)?(?<mod>\d+)$/mgi;
  const parsedVersions = {
    current: new RegExp(versionRegexp).exec(keyVaultCurrentVersion)?.groups ?? null,
    latest: new RegExp(versionRegexp).exec(keyVaultLatestVersion)?.groups ?? null
  };
  if (!parsedVersions.current?.major || !parsedVersions.latest?.major) {
    return PROCESSES.REINSTALL;
  }
  if (parseInt(parsedVersions.latest.major, 10) > parseInt(parsedVersions.current.major, 10)) {
    return PROCESSES.REINSTALL;
  }
  if (!parsedVersions.current?.minor || !parsedVersions.latest?.minor) {
    return PROCESSES.REINSTALL;
  }
  if (parseInt(parsedVersions.latest.minor, 10) > parseInt(parsedVersions.current.minor, 10)) {
    return PROCESSES.REINSTALL;
  }
  if (!parsedVersions.current?.mod || !parsedVersions.latest?.mod) {
    return PROCESSES.UPGRADE;
  }
  if (parseInt(parsedVersions.latest.mod, 10) > parseInt(parsedVersions.current.mod, 10)) {
    return PROCESSES.UPGRADE;
  }
  return PROCESSES.UPGRADE;
};
