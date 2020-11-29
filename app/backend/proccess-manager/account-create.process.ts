import KeyVaultService from '../services/key-vault/key-vault.service';
import ProcessClass from './process.class';
import AccountService from '../services/account/account.service';
import Store from '../common/store-manager/store';
import WalletService from '../services/wallet/wallet.service';

export default class AccountCreateProcess extends ProcessClass {
  private readonly walletService: WalletService;
  private readonly accountService: AccountService;
  private readonly keyVaultService: KeyVaultService;
  public readonly actions: Array<any>;
  public readonly fallbackActions: Array<any>;

  constructor(network: string) {
    super();
    const store: Store = Store.getStore();
    store.set('network', network);
    this.keyVaultService = new KeyVaultService();
    this.accountService = new AccountService();
    this.walletService = new WalletService();
    this.actions = [
      { instance: this.accountService, method: 'createAccount', params: { network }},
      { instance: this.keyVaultService, method: 'updateVaultStorage' },
      { instance: this.accountService, method: 'createBloxAccount' }
    ];

    this.fallbackActions = [
      {
        method: 'updateVaultStorage',
        actions: [{ instance: this.accountService, method: 'deleteLastIndexedAccount' }]
      },
      {
        method: 'createBloxAccount',
        actions: [
          { instance: this.accountService, method: 'deleteLastIndexedAccount' },
          { instance: this.keyVaultService, method: 'updateVaultStorage' }
        ]
      }
    ];
  }
}
