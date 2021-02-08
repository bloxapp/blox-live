import ProcessClass from './process.class';
import Connection from '../common/store-manager/connection';
import WalletService from '../services/wallet/wallet.service';
import AccountService from '../services/account/account.service';
import KeyVaultService from '../services/key-vault/key-vault.service';

export default class AccountCreateProcess extends ProcessClass {
  private readonly walletService: WalletService;
  private readonly accountService: AccountService;
  private readonly keyVaultService: KeyVaultService;
  public readonly actions: Array<any>;
  public readonly fallbackActions: Array<any>;

  constructor(network: string, indexToRestore?: number) {
    super();
    Connection.db().set('network', network);
    this.keyVaultService = new KeyVaultService();
    this.accountService = new AccountService();
    this.actions = [
      {
        instance: this.keyVaultService,
        method: 'importSlashingData'
      },
      {
        instance: this.accountService,
        method: 'createAccount',
        params: {
          indexToRestore
        }
      },
      {
        instance: this.keyVaultService,
        method: 'updateVaultStorage'
      },
      {
        instance: this.accountService,
        method: 'createBloxAccounts',
        params: {
          indexToRestore
        }
      }
    ];

    this.fallbackActions = [
      {
        method: 'createBloxAccounts',
        actions: [
          {
            instance: this.keyVaultService,
            method: 'updateVaultStorage'
          }
        ]
      }
    ];

    const firstAction = {
      instance: null,
      method: null
    };
    if (indexToRestore != null) {
      // In case of import validators - create wallet from scratch
      firstAction.instance = this.walletService;
      firstAction.method = 'createWallet';
    } else {
      // In case of one validator creation - remove failed validator only
      firstAction.instance = this.accountService;
      firstAction.method = 'deleteLastIndexedAccount';
    }

    this.fallbackActions[0].actions.unshift(firstAction);
  }
}
