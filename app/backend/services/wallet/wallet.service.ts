import { Catch, Step } from '~app/backend/decorators';
import { Log } from '~app/backend/common/logger/logger';
import { selectedKeystoreMode } from '~app/common/service';
import Connection from '~app/backend/common/store-manager/connection';
import BloxApi from '~app/backend/common/communication-manager/blox-api';
import { METHOD } from '~app/backend/common/communication-manager/constants';
import KeyVaultSsh from '~app/backend/common/communication-manager/key-vault-ssh';
import KeyManagerService from '~app/backend/services/key-manager/key-manager.service';

// @CatchClass<WalletService>()
export default class WalletService {
  private readonly keyVaultSsh: KeyVaultSsh;
  private readonly keyManagerService: KeyManagerService;
  private readonly bloxApi: BloxApi;
  private readonly logger: Log;
  private storePrefix: string;

  constructor(prefix: string = '') {
    this.storePrefix = prefix;
    this.keyVaultSsh = new KeyVaultSsh(this.storePrefix);
    this.keyManagerService = new KeyManagerService();
    this.bloxApi = new BloxApi();
    this.bloxApi.init();
    this.logger = new Log('WalletService');
  }

  async get() {
    return await this.bloxApi.request(METHOD.GET, 'wallets');
  }

  async health() {
    return await this.bloxApi.request(METHOD.GET, 'wallets/health');
  }

  async sync(payload: any) {
    return await this.bloxApi.request(METHOD.POST, 'wallets/sync', payload);
  }

  async reSync(payload: any) {
    return await this.bloxApi.request(METHOD.PATCH, 'wallets/sync', payload);
  }

  async delete() {
    // TODO request to delete wallet and not organization
    await this.bloxApi.request(METHOD.DELETE, 'organizations');
  }

  @Step({
    name: 'Creating wallet...'
  })
  @Catch({
    displayMessage: 'CLI Create Wallet failed'
  })
  async createWallet(): Promise<void> {
    const network = Connection.db(this.storePrefix).get('network');
    const storage = await this.keyManagerService.createWallet(network);
    Connection.db(this.storePrefix).set(`keyVaultStorage.${network}`, storage);
  }

  @Step({
    name: 'Remove blox wallet'
  })
  async removeBloxWallet(): Promise<void> {
    const ssh = await this.keyVaultSsh.getConnection();
    const command = this.keyVaultSsh.buildCurlCommand({
      authToken: Connection.db(this.storePrefix).get('authToken'),
      method: METHOD.DELETE,
      route: `${this.bloxApi.baseUrl}/organizations`
    });
    this.logger.debug(command);
    const { stdout, stderr } = await ssh.execCommand(command, {});
    if (stderr || +stdout !== 200) throw Error(`${stderr || stdout}. Remove blox wallet failed`);
  }

  @Step({
    name: 'Syncing KeyVault with Blox...'
  })
  async syncVaultWithBlox({ isNew, processName, isSeedless }: { isNew?: boolean, processName?: string, isSeedless?: boolean }): Promise<void> {
    const envKey = (Connection.db(this.storePrefix).get('env') || 'production');
    const seedless = isSeedless ?? selectedKeystoreMode();
    const payload: any = {
      url: `https://${Connection.db(this.storePrefix).get('publicIp')}:8200`,
      accessToken: Connection.db(this.storePrefix).get('vaultSignerToken'),
      seedless,
    };

    // Send plugin version in all cases, but only if it's available
    const pluginVersion: any = `${Connection.db(this.storePrefix).get('keyVaultPluginVersion')}${envKey === 'production' ? '' : '-rc'}`;
    if (pluginVersion) {
      payload.pluginVersion = pluginVersion;
    }
    // Send version in only recovery/install/reinstall cases
    const version: any = `${Connection.db(this.storePrefix).get('keyVaultVersion')}${envKey === 'production' ? '' : '-rc'}`;
    const shouldUpdateVersion: boolean = ['reinstall', 'install', 'recovery'].indexOf(processName) !== -1;
    if (shouldUpdateVersion && version) {
      payload.version = version;
    }
    this.logger.debugWithData('Sync KeyVault with Blox Payload:', { isNew, processName, ...payload });
    const ssh = await this.keyVaultSsh.getConnection();
    const command = this.keyVaultSsh.buildCurlCommand({
      authToken: Connection.db(this.storePrefix).get('authToken'),
      method: !isNew ? METHOD.PATCH : METHOD.POST,
      data: payload,
      route: `${this.bloxApi.baseUrl}/wallets/sync`
    });
    this.logger.debug(command);
    const { stdout, stderr } = await ssh.execCommand(command, {});
    if (stderr || +stdout !== 200) throw Error(`${stdout || ''}. ${stderr || ''}. Sync kv with blox failed`);
    Connection.db(this.storePrefix).delete('vaultSignerToken');
  }
}
