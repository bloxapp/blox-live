import AwsService from '../aws/aws.service';
import AccountService from '../account/account.service';
import KeyVaultService from '../key-vault/key-vault.service';
import DockerService from '../key-vault/docker.service';
import ProcessClass from './process.class';

export default class ReinstallProcess extends ProcessClass {
  public readonly awsService: AwsService;
  public readonly keyVaultService: KeyVaultService;
  public readonly dockerService: DockerService;
  public readonly accountService: AccountService;
  public readonly actions: Array<any>;

  constructor(storeName: string) {
    super();
    this.keyVaultService = new KeyVaultService(storeName);
    this.awsService = new AwsService(storeName);
    this.dockerService = new DockerService(storeName);
    this.accountService = new AccountService(storeName);
    this.actions = [
      { instance: this.awsService, method: 'createElasticIp' },
      { instance: this.awsService, method: 'createInstance' },
      { instance: this.dockerService, method: 'installDockerScope' },
      { instance: this.keyVaultService, method: 'runDockerContainer' },
      { instance: this.keyVaultService, method: 'runScripts' },
      { instance: this.accountService, method: 'resyncNewVaultWithBlox' },
    ];
  }
}
