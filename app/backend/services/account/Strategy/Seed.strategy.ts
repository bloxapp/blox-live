import { Log } from '~app/backend/common/logger/logger';
import Strategy from './strategy.interface';
import Connection from '../../../common/store-manager/connection';
import KeyManagerService from '../../key-manager/key-manager.service';
import config from '../../../common/config';

export default class Seed implements Strategy {
  private readonly accountService: any;
  private readonly keyManagerService: KeyManagerService;
  private readonly storePrefix: string;
  private readonly logger: Log;

  constructor(accountService) {
    this.accountService = accountService;
    this.storePrefix = accountService.storePrefix;
    this.keyManagerService = accountService.keyManagerService;
    this.logger = accountService.logger;
  }

  async recovery({ mnemonic, password }: Record<string, any>): Promise<void> {
    const seed = await this.keyManagerService.seedFromMnemonicGenerate(mnemonic);
    const accounts = await this.accountService.get();
    if (accounts.length === 0) {
      throw new Error('Validators not found');
    }
    const accountToCompareWith = accounts[0];
    const index = accountToCompareWith.name.split('-')[1];
    const account = await this.keyManagerService.getAccount(seed, index, config.env.PYRMONT_NETWORK);

    if (account.validationPubKey !== accountToCompareWith.publicKey.replace(/^(0x)/, '')) {
      throw new Error('Passphrase not linked to your account.');
    }
    Connection.db(this.storePrefix).clear();
    await Connection.db(this.storePrefix).setNewPassword(password, false);
    Connection.db(this.storePrefix).set('seed', seed);
  }

  getSeedOrKeyStores() {
    if (Connection.db().get('VALIDATORS_MODE') === 'keystore') {
      return Connection.db().get('pending_key_stores');
    }
    return Connection.db().get('seed');
  }

  async createAccount(index?: number): Promise<void> {
    const network = Connection.db(this.storePrefix).get('network');
    // 1. get public-keys to create
    return await this.keyManagerService.getAccount(Connection.db(this.storePrefix).get('seed'), index, network, true);
  }

  async createBloxAccounts(indexToRestore: number): Promise<any> {
    const network = Connection.db(this.storePrefix).get('network');
    const lastNetworkIndex = +Connection.db(this.storePrefix).get(`index.${network}`);
    const index: number = indexToRestore ?? (lastNetworkIndex + 1);
    const accumulate = indexToRestore != null;

    // Get cumulative accounts list or one account
    let accounts = await this.keyManagerService.getAccount(
      Connection.db(this.storePrefix).get('seed'),
      index,
      network,
      accumulate
    );

    if (accumulate) {
      // Reverse for account-0 on index 0 etc
      accounts = { data: accounts.reverse(), network };
    } else {
      accounts = { data: [accounts], network };
    }

    // Set imported flag for imported accounts
    accounts.data = accounts.data.map((acc) => {
      acc.imported = accumulate;
      return acc;
    });

    this.logger.debug('Created accounts', accounts);
    return accounts;
  }
}
