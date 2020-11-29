import Store from '../../common/store-manager/store';
import KeyVaultSsh from '../../common/communication-manager/key-vault-ssh';
import VersionService from '../version/version.service';
import WalletService from '../wallet/wallet.service';
import { resolveKeyVaultApi, KeyVaultApi } from '../../common/communication-manager/key-vault-api';
import { METHOD } from '../../common/communication-manager/constants';
import { CatchClass, Step } from '../../decorators';
import config from '../../common/config';

function sleep(msec) {
  return new Promise(resolve => {
    setTimeout(resolve, msec);
  });
}

// @CatchClass<KeyVaultService>()
export default class KeyVaultService {
  private readonly store: Store;
  private readonly keyVaultSsh: KeyVaultSsh;
  private readonly keyVaultApi: KeyVaultApi;
  private readonly versionService: VersionService;
  private readonly walletService: WalletService;

  constructor(storePrefix: string = '') {
    this.store = Store.getStore(storePrefix);
    this.keyVaultSsh = new KeyVaultSsh(storePrefix);
    this.versionService = new VersionService();
    this.keyVaultApi = resolveKeyVaultApi(storePrefix);
    this.walletService = new WalletService(storePrefix);
  }

  async updateStorage(payload: any) {
    return await this.keyVaultApi.requestThruSsh({
      method: METHOD.POST,
      path: 'storage',
      data: payload
    });
  }

  async listAccounts() {
    const response = await this.keyVaultApi.requestThruSsh({
      method: METHOD.LIST,
      path: 'accounts'
    });
    const errors = response?.errors;
    if (Array.isArray(errors)) {
      for (const err of errors) {
        if (err.includes('wallet not found')) {
          return [];
        }
      }
    }
    return response?.accounts || [];
  }

  async healthCheck() {
    return await this.keyVaultApi.requestThruSsh({
      method: METHOD.GET,
      path: 'sys/health',
      isNetworkRequired: false
    });
  }

  async getVersion() {
    return await this.keyVaultApi.requestThruSsh({
      method: METHOD.GET,
      path: `ethereum/${config.env.TEST_NETWORK}/version`,
      isNetworkRequired: false
    });
  }

  async getSlashingStorage() {
    const response = await this.keyVaultApi.requestThruSsh({
      method: METHOD.GET,
      path: 'storage/slashing'
    });
    const errors = response?.errors;
    if (Array.isArray(errors)) {
      for (const err of errors) {
        if (err.includes('wallet not found')) {
          return {};
        }
      }
    }
    return response?.data || {};
  }

  async getContainerId() {
    const ssh = await this.keyVaultSsh.getConnection();
    const { stdout: containerId, stderr: error } = await ssh.execCommand('docker ps -aq -f "status=running" -f "name=key_vault"', {});
    if (error) {
      throw new Error('Could not reach Docker Container');
    }
    return containerId;
  }

  async updateSlashingStorage(payload: any, network: string) {
    if (!network) {
      throw new Error('Configuration settings network not found');
    }
    return await this.keyVaultApi.requestThruSsh({
      method: METHOD.POST,
      path: `ethereum/${network}/storage/slashing`,
      data: payload,
      isNetworkRequired: false
    });
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
    name: 'Getting KeyVault authentication token...',
    requiredConfig: ['publicIp']
  })
  async getKeyVaultRootToken(): Promise<void> {
    const ssh = await this.keyVaultSsh.getConnection();
    const { stdout: rootToken } = await ssh.execCommand('sudo cat data/keys/vault.root.token', {});
    if (!rootToken) throw new Error('vault-plugin rootToken not found');
    this.store.set('vaultRootToken', rootToken);
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
    const envKey = (this.store.get('env') || 'production');
    const dockerHubImage = `bloxstaking/key-vault${envKey === 'stage' ? '-rc' : ''}:${keyVaultVersion}`;

    const dockerCMD = 'docker start key_vault 2>/dev/null || ' +
      `docker pull ${dockerHubImage} && docker run -d --restart unless-stopped --cap-add=IPC_LOCK --name=key_vault ` +
      '-v $(pwd)/data:/data ' +
      '-v $(pwd)/policies:/policies ' +
      '-p 8200:8200 ' +
      `-e VAULT_EXTERNAL_ADDRESS='${this.store.get('publicIp')}' ` +
      '-e UNSEAL=true ' +
      '-e VAULT_CLIENT_TIMEOUT=\'30s\' ';
    
    if (typeof networksList === 'object') {
      Object.entries(networksList).forEach(([key, val]) => {
        if (key !== 'test') {
          dockerCMD += `-e ${key.toUpperCase()}_GENESIS_TIME='${val}' `;
        }
      });
    }
    dockerCMD += `'${dockerHubImage}'`;
    const ssh = await this.keyVaultSsh.getConnection();
    const { stderr: error } = await ssh.execCommand(
      dockerCMD,
      {}
    );

    this.store.set('keyVaultVersion', keyVaultVersion);

    await sleep(12000);

    if (error) {
      throw new Error(`Failed to run Key Vault docker container: ${error}`);
    }
  }

  @Step({
    name: 'Updating server storage...',
    requiredConfig: ['network']
  })
  async updateVaultStorage(): Promise<void> {
    const network = this.store.get('network');
    await this.updateStorage({ data: this.store.get(`keyVaultStorage.${network}`) });
  }

  @Step({
    name: 'Updating server storage...',
    requiredConfig: ['keyVaultStorage']
  })
  async updateVaultMountsStorage(): Promise<any> {
    const keyVaultStorage = this.store.get('keyVaultStorage');

    if (keyVaultStorage) {
      // eslint-disable-next-line no-restricted-syntax
      for (const [network, storage] of Object.entries(keyVaultStorage)) {
        if (storage) {
          this.store.set('network', network);
          // eslint-disable-next-line no-await-in-loop
          await this.updateVaultStorage();
        }
      }
    }
    return { isActive: true };
  }

  @Step({
    name: 'Export slashing protection data...',
    requiredConfig: ['publicIp', 'vaultRootToken']
  })
  async exportKeyVaultData(): Promise<any> {
    const supportedNetworks = [config.env.TEST_NETWORK, config.env.MAINNET_NETWORK];
    for (const network of supportedNetworks) {
      this.store.set('network', network);
      // save latest network index
      const accounts = await this.listAccounts();
      this.store.set(`index.${network}`, (accounts.length - 1).toString());

      const slashingData = await this.getSlashingStorage();
      if (Object.keys(slashingData).length) {
        this.store.set(`slashingData.${network}`, slashingData);
      }
    }
  }

  @Step({
    name: 'Validating KeyVault final configuration...',
    requiredConfig: ['publicIp', 'vaultRootToken']
  })
  async getKeyVaultStatus() {
    // check if the key vault is alive
    await new Promise((resolve) => setTimeout(resolve, 5000));
    try {
      await this.getVersion();
      const { status } = await this.walletService.health();
      if (status !== 'active') {
        throw new Error('wallet health check: status is not active');
      }
      return { isActive: true };
    } catch (e) {
      console.log(e);
      return { isActive: false };
    }
  }
}
