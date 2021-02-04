import BloxApi from '../../common/communication-manager/blox-api';
import { METHOD } from '../../common/communication-manager/constants';
import Connection from '../../common/store-manager/connection';
import KeyVaultSsh from '../../common/communication-manager/key-vault-ssh';
import { Catch, CatchClass, Step } from '../../decorators';
import { Log } from '../../common/logger/logger';
import KeyManagerService from '../key-manager/key-manager.service';

@CatchClass<WalletService>()
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
    this.logger = new Log();
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
    try {
      const ssh = await this.keyVaultSsh.getConnection();
      const command = this.keyVaultSsh.buildCurlCommand({
        authToken: Connection.db(this.storePrefix).get('authToken'),
        method: METHOD.DELETE,
        route: `${this.bloxApi.baseUrl}/organizations`
      });
      await ssh.execCommand(command, {});
    } catch (err) {
      this.logger.error('ssh error - retrying directly', err);
      await this.delete();
    }
  }

  @Step({
    name: 'Syncing KeyVault with Blox...'
  })
  async syncVaultWithBlox({ isNew }): Promise<void> {
    const payload = {
      url: `https://${Connection.db(this.storePrefix).get('publicIp')}:8200`,
      accessToken: Connection.db(this.storePrefix).get('vaultSignerToken'),
      version: Connection.db().get('keyVaultVersion')
    };
    try {
      const ssh = await this.keyVaultSsh.getConnection();
      const command = this.keyVaultSsh.buildCurlCommand({
        authToken: Connection.db(this.storePrefix).get('authToken'),
        method: !isNew ? METHOD.PATCH : METHOD.POST,
        data: payload,
        route: `${this.bloxApi.baseUrl}/wallets/sync`
      });
      await ssh.execCommand(command, {});
      Connection.db(this.storePrefix).delete('vaultSignerToken');
    } catch (err) {
      this.logger.error('ssh error - retrying directly', err);
      await this.sync(payload);
    }
  }
}
