import BloxApi from '../../common/communication-manager/blox-api';
import { METHOD } from '../../common/communication-manager/constants';
import Store from '../../common/store-manager/store';
import KeyVaultSsh from '../../common/communication-manager/key-vault-ssh';
import { Catch, CatchClass, Step } from '../../decorators';
import { Logger } from '../../common/logger/logger';
import KeyManagerService from '../key-manager/key-manager.service';

@CatchClass<WalletService>()
export default class WalletService {
  private readonly store: Store;
  private readonly keyVaultSsh: KeyVaultSsh;
  private readonly keyManagerService: KeyManagerService;
  private readonly logger: Logger;

  constructor(storePrefix: string = '') {
    this.store = Store.getStore(storePrefix);
    this.keyVaultSsh = new KeyVaultSsh(storePrefix);
    this.keyManagerService = new KeyManagerService();
    this.logger = new Logger();
  }

  async get() {
    return await BloxApi.request(METHOD.GET, 'wallets');
  }

  async health() {
    return await BloxApi.request(METHOD.GET, 'wallets/health');
  }

  async sync(payload: any) {
    return await BloxApi.request(METHOD.POST, 'wallets/sync', payload);
  }

  async reSync(payload: any) {
    return await BloxApi.request(METHOD.PATCH, 'wallets/sync', payload);
  }

  async delete() {
    // TODO request to delete wallet and not organization
    await BloxApi.request(METHOD.DELETE, 'organizations');
  }

  @Step({
    name: 'Creating wallet...',
    requiredConfig: ['network']
  })
  @Catch({
    displayMessage: 'CLI Create Wallet failed'
  })
  async createWallet(): Promise<void> {
    const network = this.store.get('network');
    if (this.store.exists(`keyVaultStorage.${network}`)) return;
    const storage = await this.keyManagerService.createWallet();
    this.store.set(`keyVaultStorage.${network}`, storage);
  }

  @Step({
    name: 'Remove blox wallet',
    requiredConfig: ['authToken']
  })
  async removeBloxWallet(): Promise<void> {
    try {
      const ssh = await this.keyVaultSsh.getConnection();
      const command = this.keyVaultSsh.buildCurlCommand({
        authToken: this.store.get('authToken'),
        method: METHOD.DELETE,
        route: `${BloxApi.baseUrl}/organizations`
      });
      await ssh.execCommand(command, {});
    } catch (err) {
      this.logger.error('ssh error - retrying directly', err);
      await this.delete();
    }
  }

  @Step({
    name: 'Syncing KeyVault with Blox...',
    requiredConfig: ['publicIp', 'authToken', 'vaultRootToken', 'keyVaultVersion']
  })
  async syncVaultWithBlox({ isNew }): Promise<void> {
    const payload = {
      url: `http://${this.store.get('publicIp')}:8200`,
      accessToken: this.store.get('vaultRootToken'),
      version: this.store.get('keyVaultVersion')
    };
    try {
      const ssh = await this.keyVaultSsh.getConnection();
      const command = this.keyVaultSsh.buildCurlCommand({
        authToken: this.store.get('authToken'),
        method: !isNew ? METHOD.PATCH : METHOD.POST,
        data: payload,
        route: `${BloxApi.baseUrl}/wallets/sync`
      });
      await ssh.execCommand(command, {});
    } catch (err) {
      this.logger.error('ssh error - retrying directly', err);
      await this.sync(payload);
    }
  }
}
