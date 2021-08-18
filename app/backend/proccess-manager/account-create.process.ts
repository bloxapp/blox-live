import analytics from '../analytics';
import ProcessClass from './process.class';
import Connection from '../common/store-manager/connection';
import WalletService from '../services/wallet/wallet.service';
import AccountService from '../services/account/account.service';
import KeyVaultService from '../services/key-vault/key-vault.service';

export default class AccountCreateProcess extends ProcessClass {
  private readonly accountService: AccountService;
  private readonly keyVaultService: KeyVaultService;
  private readonly walletService: WalletService;
  public readonly actions: Array<any>;
  public readonly fallbackActions: Array<any>;

  constructor(network: string, indexToRestore?: number, inputData?: Array<any> | string) {
    super('Account creation');
    Connection.db().set('network', network);
    this.keyVaultService = new KeyVaultService();
    this.accountService = new AccountService();
    this.walletService = new WalletService();
    this.actions = [
      {
        instance: this.keyVaultService,
        method: 'importSlashingData'
      },
      {
        instance: this.accountService,
        method: 'createAccount',
        params: {
          indexToRestore,
          inputData
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
          indexToRestore,
          inputData
        }
      },
      // {
      //   instance: this.walletService,
      //   method: 'syncVaultWithBlox',
      //   params: {isNew: false, processName: 'account-create'}
      // },
      {
        hook: async () => {
          await analytics.track('validator-created', {
            network
          });
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
          },
          {
            hook: async () => {
              await analytics.track('error-occurred', {
                reason: 'validator-creation-failed',
                network
              });
            }
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
      firstAction.instance = this.accountService;
      firstAction.method = 'deleteAllAccounts';
    } else {
      // In case of one validator creation - remove failed validator only
      firstAction.instance = this.accountService;
      firstAction.method = 'deleteLastIndexedAccount';
    }

    this.fallbackActions[0].actions.unshift(firstAction);
  }
}
