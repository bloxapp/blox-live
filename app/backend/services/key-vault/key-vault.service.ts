import config from '../../common/config';
import { Log } from '../../common/logger/logger';
import WalletService from '../wallet/wallet.service';
import VersionService from '../version/version.service';
import { Catch, CatchClass, Step } from '../../decorators';
import Connection from '../../common/store-manager/connection';
import { isVersionHigherOrEqual } from '../../../utils/service';
import BloxApi from '../../common/communication-manager/blox-api';
import { METHOD } from '../../common/communication-manager/constants';
import KeyVaultSsh from '../../common/communication-manager/key-vault-ssh';
import KeyVaultApi from '../../common/communication-manager/key-vault-api';

function sleep(milliseconds) {
  return new Promise(resolve => {
    setTimeout(resolve, milliseconds);
  });
}

// @CatchClass<KeyVaultService>()
export default class KeyVaultService {
  private readonly keyVaultSsh: KeyVaultSsh;
  private readonly keyVaultApi: KeyVaultApi;
  private readonly versionService: VersionService;
  private readonly walletService: WalletService;
  private readonly bloxApi: BloxApi;
  private storePrefix: string;
  private logger: Log;

  constructor(prefix: string = '') {
    this.storePrefix = prefix;
    this.keyVaultSsh = new KeyVaultSsh(this.storePrefix);
    this.versionService = new VersionService();
    this.keyVaultApi = new KeyVaultApi(this.storePrefix);
    this.walletService = new WalletService(this.storePrefix);
    this.bloxApi = new BloxApi();
    this.bloxApi.init();
    this.logger = new Log('key-vault');
  }

  async updateStorage(payload: any) {
    return await this.keyVaultApi.requestThruSsh({
      method: METHOD.POST,
      path: 'storage',
      data: payload
    });
  }

  async listAccounts() {
    this.logger.info('try to get keyVault server accounts...');
    try {
      const response = await this.keyVaultApi.requestThruSsh({
        method: METHOD.LIST,
        path: 'accounts'
      });
      return response?.data.accounts || [];
    } catch (e) {
      this.logger.error(e);
      const { errors } = JSON.parse(e.message);
      if (Array.isArray(errors)) {
        // eslint-disable-next-line no-restricted-syntax
        for (const err of errors) {
          if (err.includes('wallet not found')) {
            return [];
          }
        }
      }
      throw e;
    }
  }

  async healthCheck() {
    return await this.keyVaultApi.requestThruSsh({
      method: METHOD.GET,
      path: 'sys/health',
      isNetworkRequired: false
    });
  }

  async getVersion() {
    const mainnetVersion = await this.keyVaultApi.requestThruSsh({
      method: METHOD.GET,
      path: `ethereum/${config.env.MAINNET_NETWORK}/version`,
      isNetworkRequired: false
    });
    const pyrmontVersion = await this.keyVaultApi.requestThruSsh({
      method: METHOD.GET,
      path: `ethereum/${config.env.PYRMONT_NETWORK}/version`,
      isNetworkRequired: false
    });
    const result = {
      mainnetVersion,
      pyrmontVersion
    };
    this.logger.trace('KV server healthcheck', result);
    return result;
  }

  async getSlashingStorage() {
    try {
      const response = await this.keyVaultApi.requestThruSsh({
        method: METHOD.GET,
        path: 'storage/slashing'
      });
      return response?.data || {};
    } catch (e) {
      this.logger.error(e);
      const { errors } = JSON.parse(e.message);
      if (Array.isArray(errors)) {
        // eslint-disable-next-line no-restricted-syntax
        for (const err of errors) {
          if (err.includes('wallet not found')) {
            return {};
          }
        }
      }
      throw e;
    }
  }

  async getContainerId() {
    const ssh = await this.keyVaultSsh.getConnection();
    const { stdout: containerId, stderr: error } = await ssh.execCommand('docker ps -aq -f "status=running" -f "name=key_vault"', {});
    if (error) {
      throw new Error('Could not reach Docker Container');
    }
    return containerId;
  }

  @Step({
    name: 'Installing docker...'
  })
  async installDockerScope(): Promise<void> {
    const ssh = await this.keyVaultSsh.getConnection();
    const { stdout } = await ssh.execCommand('docker -v', {});
    const installedAlready = stdout.includes('version');
    if (installedAlready) return;

    await ssh.execCommand('sudo yum update -y', {});
    await ssh.execCommand('sudo yum install docker -y', {});
    await ssh.execCommand('sudo service docker start', {});
    await ssh.execCommand('sudo usermod -a -G docker ec2-user', {});
  }

  @Step({
    name: 'Getting KeyVault authentication token...'
  })
  async getKeyVaultRootToken(): Promise<void> {
    const ssh = await this.keyVaultSsh.getConnection();
    const { stdout: rootToken } = await ssh.execCommand('sudo cat data/keys/vault.root.token', {});
    if (!rootToken) throw new Error('vault-plugin rootToken not found');
    Connection.db(this.storePrefix).set('vaultRootToken', rootToken);

    const { stdout: signerToken } = await ssh.execCommand('sudo cat data/keys/vault.signer.token', {});
    if (!signerToken) throw new Error('vault-plugin signerToken not found');
    Connection.db(this.storePrefix).set('vaultSignerToken', signerToken);

    this.logger.debug('ROOTSIGNER', rootToken, signerToken);
  }

  @Step({
    name: 'Running docker container...'
  })
  async runDockerContainer(): Promise<void> {
    const containerId = await this.getContainerId();
    if (containerId) {
      return;
    }

    const keyVaultVersion = await this.versionService.getLatestKeyVaultVersion();
    const envKey = (Connection.db(this.storePrefix).get('env') || 'production');
    const dockerHubImage = `bloxstaking/key-vault${envKey === 'production' ? '' : '-rc'}:${keyVaultVersion}`;
    this.logger.info(`Going to run docker based on ${dockerHubImage} keyvault image`);
    const dockerCMD = 'docker start key_vault 2>/dev/null || ' +
      `docker pull  ${dockerHubImage} && docker run -d --restart unless-stopped --cap-add=IPC_LOCK --name=key_vault ` +
      '-v $(pwd)/data:/data ' +
      '-v $(pwd)/policies:/policies ' +
      '-p 8200:8200 ' +
      `-e VAULT_EXTERNAL_ADDRESS='${Connection.db(this.storePrefix).get('publicIp')}' ` +
      '-e UNSEAL=true ' +
      `-e VAULT_CLIENT_TIMEOUT='30s' '${dockerHubImage}'`;

    const ssh = await this.keyVaultSsh.getConnection();
    const { stderr: error } = await ssh.execCommand(
      dockerCMD,
      {}
    );

    Connection.db(this.storePrefix).set('keyVaultVersion', keyVaultVersion);

    await sleep(12000);

    if (error) {
      this.logger.error(error);
      throw new Error(`Failed to run Key Vault docker container: ${error}`);
    }
  }

  @Step({
    name: 'Updating server storage...'
  })
  async updateVaultStorage(): Promise<void> {
    const network = Connection.db(this.storePrefix).get('network');
    if (Connection.db(this.storePrefix).exists(`keyVaultStorage.${network}`)) {
      await this.updateStorage({ data: Connection.db(this.storePrefix).get(`keyVaultStorage.${network}`) });
      Connection.db(this.storePrefix).delete(`keyVaultStorage.${network}`);
    }
  }

  @Step({
    name: 'Updating server storage...'
  })
  async updateVaultMountsStorage(): Promise<any> {
    const keyVaultStorage = Connection.db(this.storePrefix).get('keyVaultStorage');

    if (keyVaultStorage) {
      // eslint-disable-next-line no-restricted-syntax
      for (const [network, storage] of Object.entries(keyVaultStorage)) {
        if (storage) {
          Connection.db(this.storePrefix).set('network', network);
          // eslint-disable-next-line no-await-in-loop
          await this.updateVaultStorage();
        }
      }
      Connection.db(this.storePrefix).delete('keyVaultStorage');
    }
    return { isActive: true };
  }

  @Step({
    name: 'Import key-vault data...',
  })
  async importKeyVaultData(): Promise<any> {
    const supportedNetworks = [config.env.PYRMONT_NETWORK, config.env.MAINNET_NETWORK];
    // eslint-disable-next-line no-restricted-syntax
    for (const network of supportedNetworks) {
      Connection.db(this.storePrefix).set('network', network);
      // save latest network index
      // eslint-disable-next-line no-await-in-loop
      const accounts = await this.listAccounts();
      Connection.db(this.storePrefix).set(`index.${network}`, (accounts.length - 1).toString());
      // eslint-disable-next-line no-await-in-loop
      await this.importSlashingData();
    }
  }

  @Step({
    name: 'Import slashing protection data...',
  })
  async importSlashingData(): Promise<any> {
    const keyVaultVersion = Connection.db(this.storePrefix).get('keyVaultVersion');

    if (keyVaultVersion && isVersionHigherOrEqual(keyVaultVersion, config.env.HIGHEST_ATTESTATION_SUPPORTED_TAG)) {
      const network = Connection.db(this.storePrefix).get('network');
      const slashingData = await this.getSlashingStorage();
      if (Object.keys(slashingData).length) {
        Connection.db(this.storePrefix).set(`slashingData.${network}`, slashingData);
      }
    }
  }

  @Step({
    name: 'Validating KeyVault final configuration...',
  })
  async getKeyVaultStatus(retries = 2) {
    // check if the key vault is alive
    try {
      await this.getVersion();
    } catch (e) {
      if (retries === 0) {
        throw e;
      }
      this.logger.error('Sync keyvault server healthcheck failed', e);
      await new Promise((resolve) => setTimeout(resolve, 3000)); // hard delay for 2sec
      return await this.getKeyVaultStatus(retries - 1);
    }
  }

  @Step({
    name: 'Configure secure communication settings...'
  })
  @Catch({
    displayMessage: 'Configurate sshd failed'
  })
  async configurateSshd() {
    if (Connection.db(this.storePrefix).get('port')) {
      return;
    }
    try {
      await this.keyVaultSsh.getConnection(config.env.TARGET_SSH_PORT);
    } catch (e) {
      const ssh = await this.keyVaultSsh.getConnection();
      const { stderr: error } = await ssh.execCommand(`sudo sed -i '1iPort ${config.env.TARGET_SSH_PORT}\\nLoginGraceTime 30s' /etc/ssh/sshd_config && sudo service sshd restart`, {});
      if (error) {
        this.logger.error(error);
        throw new Error('Could not setup sshd configuration');
      }
    }
    Connection.db(this.storePrefix).set('port', config.env.TARGET_SSH_PORT);
  }
}
