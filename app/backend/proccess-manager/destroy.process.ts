import AwsService from '../aws/aws.service';
import AccountService from '../account/account.service';
import ProcessClass from './process.class';

export default class DestroyProcess extends ProcessClass {
  public readonly awsService: AwsService;
  public readonly accountService: AccountService;
  public readonly actions: Array<any>;

  constructor() {
    super();
    const storeName = 'blox';
    this.awsService = new AwsService(storeName);
    this.accountService = new AccountService(storeName);
    this.actions = [
      { instance: this.awsService, method: 'uninstallItems' },
      { instance: this.accountService, method: 'deleteBloxAccount' },
      { instance: this.accountService, method: 'cleanLocalStorage' },
    ];
  }
}
