import AccountService from '../account/account.service';
import ProcessClass from './process.class';

export default class AccountRemoveProcess extends ProcessClass {
  public readonly accountService: AccountService;
  public readonly actions: Array<any>;

  constructor(storeName: string) {
    super();
    this.accountService = new AccountService(storeName);
    this.actions = [
      { instance: this.accountService, method: 'deleteBloxAccount' },
    ];
  }
}
