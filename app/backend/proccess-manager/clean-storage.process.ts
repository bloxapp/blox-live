import AccountKeyVaultService from '../account/account-key-vault.service';
import KeyVaultService from '../key-vault/key-vault.service';
import ProcessClass from './process.class';
import AccountService from '../account/account.service';

export default class CleanStorageProcess extends ProcessClass {
  public readonly accountKeyVaultService: AccountKeyVaultService;
  public readonly accountService: AccountService;
  public readonly keyVaultService: KeyVaultService;
  public readonly actions: Array<any>;

  constructor() {
    super();
    const storeName = 'blox';
    this.accountKeyVaultService = new AccountKeyVaultService(storeName);
    this.keyVaultService = new KeyVaultService(storeName);
    this.accountService = new AccountService(storeName);
    this.actions = [
      { instance: this.accountService, method: 'deleteBloxAccounts' },
      { instance: this.accountKeyVaultService, method: 'createWallet' },
      { instance: this.keyVaultService, method: 'updateVaultStorage' },
    ];
  }
}
