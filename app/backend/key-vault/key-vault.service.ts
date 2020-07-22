import Configstore from 'configstore';
import got from 'got';
import ServerService from './server.service';
import { step } from '../decorators';

export default class KeyVaultService {
  public readonly conf: Configstore;
  public readonly serverService: ServerService;

  constructor(storeName: string) {
    this.conf = new Configstore(storeName);
    this.serverService = new ServerService(storeName);
  }

  @step({
    name: 'Run docker container',
  })
  async runDockerContainer(): Promise<void> {
    const ssh = await this.serverService.getConnection();
    const { stdout } = await ssh.execCommand('docker ps -a | grep bloxstaking', {});
    const runAlready = stdout.includes('bloxstaking') && !stdout.includes('Exited');
    if (runAlready) return;
    const { body: keyVaultVersion } = await got.get('http://api.stage.bloxstaking.com/key-vault/latest-tag');
    this.conf.set('keyVaultVersion', keyVaultVersion);
    await ssh.execCommand(
      `curl -L "https://raw.githubusercontent.com/bloxapp/vault-plugin-secrets-eth2.0/${keyVaultVersion}/docker-compose.yml" -o docker-compose.yml && UNSEAL=false docker-compose up -d vault-image`,
      {},
    );
  }

  @step({
    name: 'Run key vault scripts',
  })
  async runScripts(): Promise<void> {
    const ssh = await this.serverService.getConnection();
    const { stdout: containerId } = await ssh.execCommand('docker ps -aq -f "status=running" -f "name=vault"', {});
    if (!containerId) {
      throw new Error('Key Vault docker container not found');
    }
    const { stderr } = await ssh.execCommand(
      `docker exec -t ${containerId} sh -c "/bin/sh /vault/config/vault-init.sh; /bin/sh /vault/config/vault-unseal.sh; /bin/sh /vault/config/vault-plugin.sh"`,
      {},
    );
    if (stderr) {
      throw new Error(`Key Vault entrypoint scripts are failed: ${stderr}`);
    }
  }
}
