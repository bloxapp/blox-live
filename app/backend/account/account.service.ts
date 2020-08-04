import Configstore from 'configstore';
import got from 'got';
import ServerService from '../key-vault/server.service';
import { step } from '../decorators';

export default class AccountService {
  public readonly conf: Configstore;
  public readonly serverService: ServerService;

  constructor(storeName: string) {
    this.conf = new Configstore(storeName);
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
    console.log(`curl -s -o /dev/null -w "%{http_code}" --header "Content-Type: application/json" --header "Authorization: Bearer ${this.conf.get('authToken')}" --request DELETE https://api.stage.bloxstaking.com/organizations}`);
    const { stdout: statusCode, stderr } = await ssh.execCommand(
      `curl -s -o /dev/null -w "%{http_code}" --header "Content-Type: application/json" --header "Authorization: Bearer ${this.conf.get('authToken')}" --request DELETE https://api.stage.bloxstaking.com/organizations}`,
      {},
    );
    console.log(statusCode, stderr)
    if (+statusCode > 201) {
      console.log(`Blox Staking api error: ${statusCode} ${stderr}`);
    }
  }

  @step({
    name: 'Create Blox Account',
    requiredConfig: ['authToken', 'keyVaultAccounts'],
  })
  async createBloxAccount(): Promise<void> {
    const accounts = this.conf.get('keyVaultAccounts');
    console.log(accounts);
    const newAccountPos = accounts.findIndex(item => !item.syncedWithBlox);
    if (newAccountPos === -1) return;
    console.log('trying create blox account');
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
}
