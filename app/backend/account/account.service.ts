import Configstore from 'configstore';
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
    name: 'Sync vault with blox api',
    requiredConfig: ['publicIp', 'otp'],
  })
  async syncVaultWithBlox(): Promise<void> {
    // this.flow.validate('otp');
    // this.flow.validate('publicIp');
    const ssh = await this.serverService.getConnection();
    const { stdout: rootToken } = await ssh.execCommand('sudo cat data/keys/vault.root.token', {});
    if (!rootToken) throw new Error('root vault-plugin key not found');
    this.conf.set('vaultRootToken', rootToken);
    const { stdout: statusCode, stderr } = await ssh.execCommand(
      `curl -s -o /dev/null -w "%{http_code}" --header "Content-Type: application/json" --request POST --data '{"otp": "${this.conf.get(
        'otp',
      )}", "url": "http://${this.conf.get(
        'publicIp',
      )}:8200", "accessToken": "${rootToken}"}' https://api.stage.bloxstaking.com/wallets/root`,
      {},
    );
    if (+statusCode > 201) {
      throw new Error(`Blox Staking api error: ${statusCode} ${stderr}`);
    }
  }

  @step({
    name: 'Resync vault with blox api',
    requiredConfig: ['publicIp', 'otp'],
  })
  async resyncNewVaultWithBlox(): Promise<void> {
    // this.flow.validate('otp');
    // this.flow.validate('publicIp');
    const ssh = await this.serverService.getConnection();
    const { stdout: rootToken } = await ssh.execCommand('sudo cat data/keys/vault.root.token', {});
    if (!rootToken) throw new Error('root vault-plugin key not found');
    this.conf.set('vaultRootToken', rootToken);
    const { stdout: statusCode, stderr } = await ssh.execCommand(
      `curl -s -o /dev/null -w "%{http_code}" --header "Content-Type: application/json" --request PATCH --data '{"otp": "${this.conf.get(
        'otp',
      )}", "url": "http://${this.conf.get(
        'publicIp',
      )}:8200", "accessToken": "${rootToken}"}' https://api.stage.bloxstaking.com/wallets/root`,
      {},
    );
    if (+statusCode > 201) {
      throw new Error(`Blox Staking api error: ${statusCode} ${stderr}`);
    }
  }

  @step({
    name: 'Remove blox staking account',
    requiredConfig: ['otp'],
  })
  async deleteBloxAccount(): Promise<void> {
    // this.flow.validate('otp');
    const ssh = await this.serverService.getConnection();
    const { stdout: statusCode, stderr } = await ssh.execCommand(
      `curl -s -o /dev/null -w "%{http_code}" --header "Content-Type: application/json" --request DELETE https://api.stage.bloxstaking.com/organizations/otp/${this.conf.get(
        'otp',
      )}`,
      {},
    );
    if (+statusCode > 201) {
      console.log(`Blox Staking api error: ${statusCode} ${stderr}`);
    }
  }
}
