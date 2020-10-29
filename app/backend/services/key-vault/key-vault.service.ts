import Store from '../../common/store-manager/store';
import KeyVaultSsh from '../../common/communication-manager/key-vault-ssh';
import VersionService from '../version/version.service';
import WalletService from '../wallet/wallet.service';
import { resolveKeyVaultApi, KeyVaultApi } from '../../common/communication-manager/key-vault-api';
import BloxApi from '../../common/communication-manager/blox-api';
import { METHOD } from '../../common/communication-manager/constants';
import { CatchClass, Step } from '../../decorators';
import config from '../../common/config';

const STABLE_TAG = 'v0.1.11';

function numVal(str) {
  return str.replace(/\D/g, '');
}

function sleep(msec) {
  return new Promise(resolve => {
    setTimeout(resolve, msec);
  });
}

@CatchClass<KeyVaultService>()
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
    this.keyVaultApi.init();
    return await this.keyVaultApi.request(METHOD.POST, 'storage', payload);
  }

  async listAccounts() {
    this.keyVaultApi.init();
    return await this.keyVaultApi.request(METHOD.LIST, 'accounts');
  }

  async healthCheck() {
    this.keyVaultApi.init(false);
    return await this.keyVaultApi.request(METHOD.GET, 'sys/health');
  }

  async getVersion() {
    this.keyVaultApi.init(false);
    return await this.keyVaultApi.request(METHOD.GET, `ethereum/${config.env.TEST_NETWORK}/version`);
  }

  async getSlashingStorage(network: string) {
    if (!network) {
      throw new Error('Configuration settings network not found');
    }
    this.keyVaultApi.init(false);
    return await this.keyVaultApi.request(METHOD.GET, `ethereum/${network}/storage/slashing`);
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
    this.keyVaultApi.init(false);
    return await this.keyVaultApi.request(METHOD.POST, `ethereum/${network}/storage/slashing`, payload);
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
    const dockerHubImage = envKey === 'production' ?
      `bloxstaking/key-vault:${keyVaultVersion}` :
      `bloxstaking/key-vault-rc:${keyVaultVersion}`;

    const networksList = await BloxApi.request(METHOD.GET, 'ethereum2/genesis-time');

    let dockerCMD = 'docker start key_vault 2>/dev/null || ' +
      `docker pull  ${dockerHubImage} && docker run -d --restart unless-stopped --cap-add=IPC_LOCK --name=key_vault ` +
      '-v $(pwd)/data:/data ' +
      '-v $(pwd)/policies:/policies ' +
      '-p 8200:8200 ' +
      '-e UNSEAL=true ' +
      "-e VAULT_ADDR='http://127.0.0.1:8200' " +
      "-e VAULT_API_ADDR='http://127.0.0.1:8200' " +
      "-e VAULT_CLIENT_TIMEOUT='30s' ";

    if (networksList.test) {
      dockerCMD += `-e TESTNET_GENESIS_TIME='${networksList.test}' `;
    }
    if (networksList.zinken) {
      dockerCMD += `-e ZINKEN_GENESIS_TIME='${networksList.zinken}' `;
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
      throw new Error('Failed to run Key Vault docker container');
    }
  }

  @Step({
    name: 'Updating server storage...',
    requiredConfig: ['publicIp', 'vaultRootToken', 'keyVaultStorage', 'network']
  })
  async updateVaultStorage(): Promise<void> {
    const network = this.store.get('network');
    await this.updateStorage({ data: this.store.get(`keyVaultStorage.${network}`) });
  }

  @Step({
    name: 'Updating server storage...'
  })
  async updateVaultMountsStorage(): Promise<void> {
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
  }

  @Step({
    name: 'Export slashing protection data...',
    requiredConfig: ['publicIp', 'vaultRootToken']
  })
  async importSlashingData(): Promise<any> {
    const keyVaultStorage = this.store.get('keyVaultStorage');
    // check if kv version higher or equal stable tag
    const currentVersion = (await this.getVersion()).data.version;
    if (numVal(currentVersion) < numVal(STABLE_TAG)) {
      return;
    }
    if (keyVaultStorage) {
      // eslint-disable-next-line no-restricted-syntax
      for (const [network, storage] of Object.entries(keyVaultStorage)) {
        if (storage) {
          // eslint-disable-next-line no-await-in-loop
          const slashingData = await this.getSlashingStorage(network);
          if (Object.keys(slashingData.data).length) {
            this.store.set(`slashingData.${network}`, slashingData.data);
          }
        }
      }
    }
  }

  @Step({
    name: 'Import slashing protection data...',
    requiredConfig: ['publicIp', 'vaultRootToken']
  })
  async exportSlashingData(): Promise<any> {
    const slashingData = this.store.get('slashingData');
    // check if kv version higher or equal stable tag
    const currentVersion = (await this.getVersion()).data.version;
    if (numVal(currentVersion) < numVal(STABLE_TAG)) {
      return;
    }

    if (slashingData) {
      // eslint-disable-next-line no-restricted-syntax
      for (const [network, storage] of Object.entries(slashingData)) {
        if (storage) {
          // eslint-disable-next-line no-await-in-loop
          await this.updateSlashingStorage(storage, network);
        }
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
