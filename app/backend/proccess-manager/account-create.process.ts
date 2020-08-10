import AccountKeyVaultService from '../account/account-key-vault.service';
import KeyVaultService from '../key-vault/key-vault.service';
import ProcessClass from './process.class';
import AccountService from '../account/account.service';

export default class AccountCreateProcess extends ProcessClass {
  public readonly accountKeyVaultService: AccountKeyVaultService;
  public readonly accountService: AccountService;
  public readonly keyVaultService: KeyVaultService;
  public readonly actions: Array<any>;

  constructor() {
    super();
    this.accountKeyVaultService = new AccountKeyVaultService(this.storeName);
    this.keyVaultService = new KeyVaultService(this.storeName);
    this.accountService = new AccountService(this.storeName);
    this.actions = [
      { instance: this.accountKeyVaultService, method: 'createAccount' },
      { instance: this.keyVaultService, method: 'updateVaultStorage' },
      { instance: this.accountService, method: 'createBloxAccount' },
    ];
  }
}
