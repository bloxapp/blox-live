import AwsService from '../aws/aws.service';
import ProcessClass from './process.class';
import KeyVaultService from '../key-vault/key-vault.service';

export default class RebootProcess extends ProcessClass {
  public readonly awsService: AwsService;
  public readonly keyVaultService: KeyVaultService;
  public readonly actions: Array<any>;

  constructor() {
    super();
    const storeName = 'blox';
    this.awsService = new AwsService(storeName);
    this.keyVaultService = new KeyVaultService(storeName);
    this.actions = [
      { instance: this.awsService, method: 'rebootInstance' },
      { instance: this.keyVaultService, method: 'getKeyVaultStatusFail' },
    ];
  }
}
