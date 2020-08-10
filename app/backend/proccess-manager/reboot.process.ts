import AwsService from '../aws/aws.service';
import ProcessClass from './process.class';
import KeyVaultService from '../key-vault/key-vault.service';

export default class RebootProcess extends ProcessClass {
  public readonly awsService: AwsService;
  public readonly keyVaultService: KeyVaultService;
  public readonly actions: Array<any>;

  constructor() {
    super();
    this.awsService = new AwsService(this.storeName);
    this.keyVaultService = new KeyVaultService(this.storeName);
    this.actions = [
      { instance: this.awsService, method: 'rebootInstance' },
      { instance: this.keyVaultService, method: 'getKeyVaultStatusFail' },
    ];
  }
}
