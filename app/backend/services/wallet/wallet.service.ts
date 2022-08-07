import { Catch, Step } from '~app/backend/decorators';
import { Log } from '~app/backend/common/logger/logger';
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

  async forceSyncAccounts(payload: any) {
    return await this.bloxApi.request(METHOD.PATCH, 'wallets/refresh', payload);
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
  async syncVaultWithBlox(): Promise<void> {
    this.logger.debugWithData('Sync KeyVault with Blox Payload');
    const ssh = await this.keyVaultSsh.getConnection();
    const command = this.keyVaultSsh.buildCurlCommand({
      authToken: Connection.db(this.storePrefix).get('authToken'),
      method: METHOD.POST,
      route: `${this.bloxApi.baseUrl}/wallets/refresh?components=config`
    });
    this.logger.debug(command);
    const { stdout, stderr } = await ssh.execCommand(command, {});
    if (stderr || +stdout !== 200) throw Error(`${stdout || ''}. ${stderr || ''}. Sync kv with blox failed`);
    Connection.db(this.storePrefix).delete('vaultSignerToken');
  }
}
