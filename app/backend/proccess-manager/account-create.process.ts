import SeedService from '../key-vault/seed.service';
import AccountKeyVaultService from '../account/account-key-vault.service';
import ProcessClass from './process.class';

export default class AccountCreateProcess extends ProcessClass {
  public readonly seedService: SeedService;
  public readonly accountKeyVaultService: AccountKeyVaultService;
  public readonly actions: Array<any>;

  constructor(storeName: string) {
    super();
    this.seedService = new SeedService(storeName);
    this.accountKeyVaultService = new AccountKeyVaultService(storeName);
    this.actions = [
      { instance: this.seedService, method: 'seedGenerate' },
      { instance: this.accountKeyVaultService, method: 'accountCreate' },
    ];
  }
}
