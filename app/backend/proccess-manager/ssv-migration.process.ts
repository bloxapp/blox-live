import AwsService from '~app/backend/services/aws/aws.service';
import ProcessClass from '~app/backend/proccess-manager/process.class';
import WalletService from '~app/backend/services/wallet/wallet.service';
import Connection from '~app/backend/common/store-manager/connection';
import SsvMigrationService from '~app/backend/services/ssv-migration/ssv-migration.service';
import AccountService from '~app/backend/services/account/account.service';

import { getValidatorKeysFromSeed } from '~app/backend/services/validator-Keys/index';

export default class SsvMigrationProcess extends ProcessClass {
  private readonly ssvMigrationService: SsvMigrationService;
  private readonly accountService: AccountService;
  private readonly awsService: AwsService;
  private readonly walletService: WalletService;
  public readonly actions: Array<any>;

  constructor({ ownerAddress }) {
    super();
    this.ssvMigrationService = new SsvMigrationService();
    this.accountService = new AccountService();
    // this.awsService = new AwsService();
    // this.walletService = new WalletService();
    this.actions = [
      {
        hook: async () => {
          // 0. get accounts
          const accounts = await this.accountService.get();
          // 1. extract private keys from seed
          const keysFromSeed = await getValidatorKeysFromSeed(Connection.db().get('seed'), accounts.length);
          const privateKeys = keysFromSeed.map((key) => key.privateKey);
          // 2. build keyshares by private keys
          await this.ssvMigrationService.init();
          const keyShares = await this.ssvMigrationService.buildByPrivateKeys(ownerAddress, privateKeys);
          console.log('keyshares', keyShares);
          const filePath = await this.ssvMigrationService.storeKeyShares(keyShares);
          console.log('keyshares stored at', filePath);
        }
      },
      {
        hook: async () => {
          console.log('step 1');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      },
      {
        hook: async () => {
          console.log('step 2');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      },
      /*
      {instance: this.walletService, method: 'removeBloxWallet'},
      {instance: this.awsService, method: 'uninstallItems'},
      {
        instance: Connection,
        method: 'remove',
        params: {
          prefix: ''
        }
      }
      */
    ];
  }
}
