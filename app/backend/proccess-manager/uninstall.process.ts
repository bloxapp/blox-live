import AwsService from '../aws/aws.service';
import AccountService from '../account/account.service';
import ProcessClass from './process.class';

export default class UninstallProcess extends ProcessClass {
  public readonly awsService: AwsService;
  public readonly accountService: AccountService;
  public readonly actions: Array<any>;

  constructor() {
    super();
    this.awsService = new AwsService(this.storeName);
    this.accountService = new AccountService(this.storeName);
    this.actions = [
      { instance: this.awsService, method: 'uninstallItems' },
      { instance: this.accountService, method: 'deleteBloxAccount' },
      { instance: this.accountService, method: 'cleanLocalStorage' },
    ];
  }
}
