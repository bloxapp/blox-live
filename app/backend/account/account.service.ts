import ElectronStore from 'electron-store';
import got from 'got';
import ServerService from '../key-vault/server.service';
import { step } from '../decorators';

export default class AccountService {
  public readonly conf: ElectronStore;
  public readonly serverService: ServerService;
  public readonly storeName: string;

  constructor(storeName: string) {
    this.storeName = storeName;
    this.conf = new ElectronStore({ name: storeName });
    this.serverService = new ServerService(storeName);
  }

  @step({
    name: 'Get key vault root token',
    requiredConfig: ['publicIp'],
  })
  async getKeyVaultRootToken(): Promise<void> {
    const ssh = await this.serverService.getConnection();
    const { stdout: rootToken } = await ssh.execCommand('sudo cat data/keys/vault.root.token', {});
    if (!rootToken) throw new Error('root vault-plugin key not found');
    this.conf.set('vaultRootToken', rootToken);
  }

  @step({
    name: 'Sync vault with blox api',
    requiredConfig: ['publicIp', 'authToken', 'vaultRootToken'],
  })
  async syncVaultWithBlox(): Promise<void> {
    const ssh = await this.serverService.getConnection();
    const { stdout: statusCode, stderr } = await ssh.execCommand(
      `curl -s -o /dev/null -w "%{http_code}" --header "Content-Type: application/json" --header "Authorization: Bearer ${this.conf.get('authToken')}" --request POST --data '{"url": "http://${this.conf.get('publicIp')}:8200", "accessToken": "${this.conf.get('vaultRootToken')}"}' https://api.stage.bloxstaking.com/wallets/sync`,
      {},
    );
    if (+statusCode > 201) {
      throw new Error(`Blox Staking api error: ${statusCode} ${stderr}`);
    }
  }

  @step({
    name: 'Resync vault with blox api',
    requiredConfig: ['publicIp', 'authToken', 'vaultRootToken'],
  })
  async resyncNewVaultWithBlox(): Promise<void> {
    const ssh = await this.serverService.getConnection();
    const { stdout: statusCode, stderr } = await ssh.execCommand(
      `curl -s -o /dev/null -w "%{http_code}" --header "Content-Type: application/json" --header "Authorization: Bearer ${this.conf.get('authToken')}" --request PATCH --data '{"url": "http://${this.conf.get('publicIp')}:8200", "accessToken": "${this.conf.get('vaultRootToken')}"}' https://api.stage.bloxstaking.com/wallets/sync`,
      {},
    );
    if (+statusCode > 201) {
      throw new Error(`Blox Staking api error: ${statusCode} ${stderr}`);
    }
  }

  @step({
    name: 'Remove blox staking account',
    requiredConfig: ['authToken'],
  })
  async deleteBloxAccount(): Promise<void> {
    const ssh = await this.serverService.getConnection();
    const { stdout: statusCode, stderr } = await ssh.execCommand(
      `curl -s -o /dev/null -w "%{http_code}" --header "Content-Type: application/json" --header "Authorization: Bearer ${this.conf.get('authToken')}" --request DELETE https://api.stage.bloxstaking.com/organizations`,
      {},
    );
    console.log(statusCode, stderr);
    if (+statusCode > 201) {
      console.log(`Blox Staking api error: ${statusCode} ${stderr}`);
    }
  }

  @step({
    name: 'Remove Organization Accounts',
    requiredConfig: ['authToken'],
  })
  async deleteBloxAccounts(): Promise<void> {
    try {
      await got.delete('https://api.stage.bloxstaking.com/accounts', {
        headers: {
          'Authorization': `Bearer ${this.conf.get('authToken')}`,
        }
      });
      this.conf.delete('keyVaultStorage');
      console.log('blox accounts deleted');
    } catch (error) {
      throw new Error(`Blox Staking api error: ${error}`);
    }
  }

  @step({
    name: 'Create Blox Account',
    requiredConfig: ['authToken', 'keyVaultAccounts'],
  })
  async createBloxAccount(): Promise<void> {
    const accounts : any = this.conf.get('keyVaultAccounts');
    const newAccountPos = accounts.findIndex(item => !item.syncedWithBlox);
    if (newAccountPos === -1) return;
    try {
      const { body } = await got.post('https://api.stage.bloxstaking.com/accounts', {
        headers: {
          'Authorization': `Bearer ${this.conf.get('authToken')}`,
        },
        body: accounts[newAccountPos],
        // @ts-ignore
        json: true,
      });
      console.log('createBloxAccount', body);
      accounts[newAccountPos].syncedWithBlox = true;
      this.conf.set('keyVaultAccounts', accounts);
      console.log('blox account created');
    } catch (error) {
      throw new Error(`Vault plugin api error: ${error}`);
    }
  }

  @step({
    name: 'Clean local storage',
  })
  public cleanLocalStorage(): void {
    this.conf.clear();
  }

  @step({
    name: 'Prepare tmp storage',
  })
  public prepareTmpStorageConfig(): void {
    this.setClientStorageParams(`${this.storeName}-tmp`, {
      uuid: this.conf.get('uuid'),
      authToken: this.conf.get('authToken'),
      credentials: this.conf.get('credentials'),
      keyPair: this.conf.get('keyPair'),
      securityGroupId: this.conf.get('securityGroupId'),
      keyVaultStorage: this.conf.get('keyVaultStorage'),
    });
  }

  @step({
    name: 'Store tmp config into main',
  })
  public saveTmpConfigIntoMain(): void {
    const confTmpStore = new ElectronStore({ name: `${this.storeName}-tmp` });
    this.setClientStorageParams(this.storeName, {
      uuid: confTmpStore.get('uuid'),
      authToken: confTmpStore.get('authToken'),
      addressId: confTmpStore.get('addressId'),
      publicIp: confTmpStore.get('publicIp'),
      instanceId: confTmpStore.get('instanceId'),
      vaultRootToken: confTmpStore.get('vaultRootToken'),
      keyVaultVersion: confTmpStore.get('keyVaultVersion'),
      keyVaultStorage: confTmpStore.get('keyVaultStorage'),
    });
    confTmpStore.clear();
  }

  private setClientStorageParams(storeName: string, params: any): void {
    const conf = new ElectronStore({ name: storeName });
    Object.keys(params).forEach((key) => {
      params[key] && conf.set(key, params[key]);
    });
  }
}
