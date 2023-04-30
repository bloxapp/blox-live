import {shell} from 'electron';
import config from 'backend/common/config';
import OrganizationService from '../../backend/services/organization/organization.service';
import Connection from '../../backend/common/store-manager/connection';
import {version} from '../../package.json';
import FormData from 'form-data';
import { NETWORKS } from '~app/components/Wizard/components/Validators/constants';

export const truncateText = (value, fromStartIndex, fromEndIndex) => {
  if (value == null || !value.length) {
    return value;
  }
  return `${value.substring(0, fromStartIndex)}...${value.substring(value.length - fromEndIndex)}`;
};

export const openExternalLink = async (url, base: string = undefined) => {
  const fullUrl = `${config.env.WEBSITE_URL}/${url}`;
  await shell.openExternal(`${base ?? fullUrl}`);
};

export const trimTrailingSlash = (url: string) => url.replace(/\/$/, '');

/**
 * Open specific path on etherscan depending on network
 * @param path
 * @param network
 */
export const openEtherscanLink = async (path: string, network: string): Promise<void> => {
  let link = '';
  switch (network) {
    case NETWORKS.mainnet.label:
      link = `${trimTrailingSlash(config.env.ETHERSCAN_LINK.MAINNET)}/${trimTrailingSlash(path)}`;
      break;
    case NETWORKS.prater.label:
      link = `${trimTrailingSlash(config.env.ETHERSCAN_LINK.TESTNET)}/${trimTrailingSlash(path)}`;
      break;
  }
  if (link) {
    await shell.openExternal(link);
  }
};

export const reportCrash = async () => {
  const organizationService = new OrganizationService();
  const form = new FormData();
  const keyVaultVersion = Connection.db().get('keyVaultVersion');
  keyVaultVersion
    ? form.append('keyVaultVersion', keyVaultVersion)
    : form.append('keyVaultVersion', 'empty');
  form.append('appVersion', version);
  await organizationService.reportCrash(form);
};
