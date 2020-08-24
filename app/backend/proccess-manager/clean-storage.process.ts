import AccountKeyVaultService from '../account/account-key-vault.service';
import KeyVaultService from '../key-vault/key-vault.service';
import ProcessClass from './process.class';
import AccountService from '../account/account.service';

export default class CleanStorageProcess extends ProcessClass {
  private readonly accountKeyVaultService: AccountKeyVaultService;
  private readonly accountService: AccountService;
  private readonly keyVaultService: KeyVaultService;
  public readonly actions: Array<any>;

  constructor() {
    super();
    this.accountKeyVaultService = new AccountKeyVaultService();
    this.keyVaultService = new KeyVaultService();
    this.accountService = new AccountService();
    this.actions = [
      { instance: this.accountService, method: 'deleteBloxAccounts' },
      { instance: this.accountKeyVaultService, method: 'createWallet' },
      { instance: this.keyVaultService, method: 'updateVaultStorage' }
    ];
  }
}
