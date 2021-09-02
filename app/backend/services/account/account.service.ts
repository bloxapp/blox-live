import Web3 from 'web3';
import {hexDecode} from '~app/utils/service';
import config from '~app/backend/common/config';
import {Catch, Step} from '~app/backend/decorators';
import {Log} from '~app/backend/common/logger/logger';
import {selectedKeystoreMode} from '~app/common/service';
import Connection from '~app/backend/common/store-manager/connection';
import WalletService from '~app/backend/services/wallet/wallet.service';
import BloxApi from '~app/backend/common/communication-manager/blox-api';
import {METHOD} from '~app/backend/common/communication-manager/constants';
import KeyVaultService from '~app/backend/services/key-vault/key-vault.service';
import BeaconchaApi from '~app/backend/common/communication-manager/beaconcha-api';
import KeyManagerService from '~app/backend/services/key-manager/key-manager.service';

type CreateBloxAccountsInBatchParams = {
  network: string,
  accounts: any,
  imported: boolean
};

export default class AccountService {
  private readonly walletService: WalletService;
  private readonly keyVaultService: KeyVaultService;
  private readonly keyManagerService: KeyManagerService;
  private readonly bloxApi: BloxApi;
  private readonly beaconchaApi: BeaconchaApi;
  private storePrefix: string;
  private logger: Log;

  constructor(prefix: string = '') {
    this.storePrefix = prefix;
    this.walletService = new WalletService();
    this.keyVaultService = new KeyVaultService();
    this.keyManagerService = new KeyManagerService();
    this.bloxApi = new BloxApi();
    this.bloxApi.init();
    this.logger = new Log('accounts');
    this.beaconchaApi = new BeaconchaApi();
  }

  async get() {
    return await this.bloxApi.request(METHOD.GET, 'accounts');
  }

  async create(payload: any) {
    return await this.bloxApi.request(METHOD.POST, 'accounts', payload);
  }

  async delete() {
    return await this.bloxApi.request(METHOD.DELETE, 'accounts');
  }

  @Catch({
    displayMessage: 'Get highest attestation failed'
  })
  async getHighestAttestation(payload: any, retries = 2) {
    if (payload.public_keys.length === 0) return {};
    try {
      this.beaconchaApi.init(payload.network);
      const generalData = await this.bloxApi.request(METHOD.POST, 'ethereum2/highest-attestation', payload);
      const beaconchaData = await this.beaconchaApi.request(METHOD.GET, 'block/latest');
      const keyManagerData = await this.keyManagerService.getAttestation(payload.network);
      this.logger.trace('getHighestAttestation: raw answers', generalData, beaconchaData, keyManagerData);
      Object.keys(generalData).forEach(key => {
        const {
          highest_source_epoch: bloxSourceEpoch,
          highest_target_epoch: bloxTargetEpoch,
          highest_proposal_slot: bloxSlot
        } = generalData[key];
        const {slot: beaconchaSlot, epoch: beaconchaEpoch} = beaconchaData?.data;
        [
          beaconchaSlot,
          beaconchaEpoch,
          bloxSourceEpoch,
          bloxTargetEpoch,
          bloxSlot
        ].forEach(value => {
          // eslint-disable-next-line no-restricted-globals
          if (isNaN(value)) throw new Error(`${value} is not number value`);
        });
        const epoch = Math.max(...[
          bloxSourceEpoch,
          bloxTargetEpoch,
          beaconchaEpoch,
          keyManagerData.epoch
        ]);
        const slot = Math.max(...[
          bloxSlot,
          beaconchaSlot,
          keyManagerData.slot
        ]);
        generalData[key] = {
          highest_proposal_slot: slot,
          highest_source_epoch: epoch,
          highest_target_epoch: epoch
        };
      });
      this.logger.info('getHighestAttestation: selected', generalData);
      return generalData;
    } catch (e) {
      if (retries === 0) {
        throw e;
      }
      this.logger.error('getHighestAttestation: fails, retry...', e);
      await new Promise((resolve) => setTimeout(resolve, 2000)); // hard delay for 2sec
      return await this.getHighestAttestation(payload, retries - 1);
    }
  }

  async updateStatus(route: string, payload: any) {
    if (!route) {
      throw new Error('route');
    }
    return await this.bloxApi.request(METHOD.PATCH, `accounts/${route}`, payload);
  }

  /**
   * Create blox accounts in batch
   * @param indexToRestore
   */
  async createBloxAccountsInBatch({network, accounts, imported}: CreateBloxAccountsInBatchParams): Promise<any> {
    const accountsList = {data: accounts, network};
    // Set imported flag for imported accounts
    accountsList.data = accountsList.data.map((acc) => {
      acc.imported = imported;
      if (selectedKeystoreMode()) {
        acc.withdrawalPubKey = acc.validationPubKey;
      }
      return acc;
    });

    // Create accounts in blox api
    return this.create(accountsList);
  }

  @Step({
    name: 'Create Blox Accounts'
  })
  @Catch({
    displayMessage: 'Create Blox Accounts failed'
  })
  async createBloxAccounts({indexToRestore, inputData, deposited}: { indexToRestore?: number, inputData?: string, deposited?: boolean }): Promise<any> {
    const network = Connection.db(this.storePrefix).get('network');
    const lastNetworkIndex = +Connection.db(this.storePrefix).get(`index.${network}`);
    const index: number = indexToRestore ?? (lastNetworkIndex + 1);
    const accumulate = indexToRestore != null;

    // Get cumulative accounts list or one account
    let accounts = await this.keyManagerService.getAccount(
      inputData,
      index,
      network,
      accumulate
    );
    // For accumulated accounts - they are already an array
    // For seedless accounts - they are also an array
    if (!Array.isArray(accounts)) {
      accounts = [accounts];
    }

    /**
     * Sort accounts by account index
     * @param account1
     * @param account2
     */
    const accountsSorter = (account1, account2) => {
      const account1Index = parseInt(account1.name.replace('account-', 0), 10);
      const account2Index = parseInt(account2.name.replace('account-', 0), 10);
      if (account1Index > account2Index) {
        return 1;
      }
      if (account1Index < account2Index) {
        return -1;
      }
      return 0;
    };

    accounts.sort(accountsSorter);

    console.debug('Accounts about to register:', accounts);

    const batchSize = config.env.CREATE_BLOX_ACCOUNTS_BATCH_SIZE;
    let createdAccounts = [];
    for (let batch = 0; batch < Math.ceil(accounts.length / batchSize); batch += 1) {
      // Get next batch
      const batchIndexFrom = batch * batchSize;
      const batchIndexTo = batch * batchSize + batchSize;
      const batchedAccounts = accounts.slice(batchIndexFrom, batchIndexTo);

      console.debug(`Registering batched accounts in Blox with indexes '${batchIndexFrom}':'${batchIndexTo}'.`);
      console.debug('Accounts:', batchedAccounts);

      // Try few times
      const createAccountsMaxAttempts = 3;
      let isError = false;
      for (let i = 1; i <= createAccountsMaxAttempts; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        const account = await this.createBloxAccountsInBatch({
          network,
          accounts: batchedAccounts,
          imported: accumulate || !!deposited,
        });
        isError = account.error && account.error instanceof Error;
        if (!isError) {
          createdAccounts = [...createdAccounts, ...account];
          break;
        }
      }
      if (isError) {
        // When error persistently happens - return nothing, it means process doesn't go well
        return;
      }
    }

    // Sort all the final accounts in ascending mode to return from this step
    createdAccounts.sort(accountsSorter);

    this.logger.debug('Created accounts', createdAccounts);
    return {data: createdAccounts};
  }

  @Step({
    name: 'Create Account'
  })
  @Catch({
    displayMessage: 'CLI Create Account failed'
  })
  async createAccount({ indexToRestore, inputData }: { indexToRestore?: number, inputData?: string }): Promise<void> {
    const network = Connection.db(this.storePrefix).get('network');
    const index: number = indexToRestore ?? await this.getNextIndex(network);

    // Get cumulative accounts list or one account
    let accounts = await this.keyManagerService.getAccount(
        inputData,
        index,
        network,
    );

    // For accumulated accounts - they are already an array
    // For seedless accounts - they are also an array
    if (!Array.isArray(accounts)) {
      accounts = [accounts];
    }

    const accountsHash = Object.assign({}, ...accounts.map(account => ({[account.validationPubKey]: account})));
    const publicKeysToGetHighestAttestation = [];

    // 2. get slashing data if exists
    let slashingData = {};
    if (Connection.db(this.storePrefix).exists(`slashingData.${network}`)) {
      slashingData = Connection.db(this.storePrefix).get(`slashingData.${network}`);
      Connection.db(this.storePrefix).delete('slashingData');
    }

    // 3. update accounts-hash from exist slashing storage
    // eslint-disable-next-line no-restricted-syntax
    for (const key of Object.keys(accountsHash)) {
      // eslint-disable-next-line no-prototype-builtins
      if (slashingData && slashingData.hasOwnProperty(key)) {
        const decodedValue = hexDecode(slashingData[key]);
        const decodedValueJson = JSON.parse(decodedValue);
        const highestAttestation = {
          'highest_source_epoch': decodedValueJson?.HighestAttestation?.source?.epoch,
          'highest_target_epoch': decodedValueJson?.HighestAttestation?.target?.epoch,
          'highest_proposal_slot': decodedValueJson?.HighestProposal?.slot,
        };
        accountsHash[key] = {...accountsHash[key], ...highestAttestation};
      } else {
        publicKeysToGetHighestAttestation.push(key);
      }
    }
    // 4. get highest attestation from slasher to missing public-keys
    const highestAttestationsMap = await this.getHighestAttestation({
      'public_keys': publicKeysToGetHighestAttestation,
      network
    });

    // 5. update accounts-hash from slasher
    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of Object.entries(highestAttestationsMap)) {
      // @ts-ignore
      accountsHash[key] = {...accountsHash[key], ...value};
    }

    const accountsArray = Object.values(accountsHash);

    const highestSource = accountsArray.map(({ highest_source_epoch }) => highest_source_epoch);
    const highestTarget = accountsArray.map(({ highest_target_epoch }) => highest_target_epoch);
    const highestProposal = accountsArray.map(({ highest_proposal_slot }) => highest_proposal_slot);

    // // // 6. create accounts
    const storage = await this.keyManagerService.createAccount(inputData, index, network, highestSource.join(','), highestTarget.join(','), highestProposal.join(','));
    Connection.db(this.storePrefix).set(`keyVaultStorage.${network}`, storage);
  }

  @Step({
    name: 'Restore Accounts'
  })
  @Catch({
    displayMessage: 'CLI Create Account failed'
  })
  async restoreAccounts({ inputData }: { inputData?: string }): Promise<void> {
    const supportedNetworks = [config.TESTNET_NETWORK, config.env.MAINNET_NETWORK];

    const indices = Connection.db(this.storePrefix).get('index');
    if (indices) {
      // eslint-disable-next-line no-restricted-syntax
      for (const [network, lastIndex] of Object.entries(indices)) {
        if (supportedNetworks.indexOf(network) > -1) {
          const index = +lastIndex;
          if (index > -1) {
            Connection.db(this.storePrefix).set('network', network);
            // eslint-disable-next-line no-await-in-loop
            await this.createAccount({ indexToRestore: index, inputData });
          }
        }
      }
    }
  }

  async getNextIndex(network: string): Promise<number> {
    let index = 0;
    this.logger.debug('try getIndex...');
    const accounts = await this.keyVaultService.listAccounts();
    this.logger.debug('getnextindex', accounts);
    if (accounts.length) {
      index = +accounts[0].name.replace('account-', '') + 1;
    }
    Connection.db(this.storePrefix).set(`index.${network}`, (index - 1).toString());
    return index;
  }

  async getDepositData(pubKey: string, index: number, network: string): Promise<any> {
    if (!network) { // TODO: validate networks
      throw new Error('netwrok is missing');
    }
    if (!pubKey) {
      throw new Error('publicKey is empty');
    }
    const publicKeyWithoutPrefix = pubKey.replace(/^(0x)/, '');
    const depositData = await this.keyManagerService.getDepositData(Connection.db(this.storePrefix).get('seed'), index, publicKeyWithoutPrefix, network);
    const {
      publicKey,
      withdrawalCredentials,
      signature,
      depositDataRoot,
      depositContractAddress
    } = depositData;

    const depositContractABI = require('./deposit_abi.json');
    const coin = network === config.env.MAINNET_NETWORK ? 'ETH' : 'GoETH';

    const web3 = new Web3(
      'https://goerli.infura.io/v3/d03b92aa81864faeb158166231b7f895'
    );
    const depositContract = new web3.eth.Contract(depositContractABI, depositContractAddress);
    const depositMethod = depositContract.methods.deposit(
      `0x${publicKey}`,
      `0x${withdrawalCredentials}`,
      `0x${signature}`,
      `0x${depositDataRoot}`
    );

    const data = depositMethod.encodeABI();
    return {
      txData: data,
      network,
      accountIndex: index,
      publicKey,
      depositTo: depositContractAddress,
      coin,
      withdrawalCredentials
    };
  }

  @Step({
    name: 'Delete Last Indexed Account'
  })
  async deleteLastIndexedAccount(): Promise<void> {
    // TODO: what is going to happen here on seedless mode?
    const network = Connection.db(this.storePrefix).get('network');
    if (!network) {
      throw new Error('Configuration settings network not found');
    }
    const index: number = +Connection.db(this.storePrefix).get(`index.${network}`);
    if (index < 0) {
      await this.walletService.createWallet();
    } else {
      await this.createAccount({indexToRestore: index});
    }
  }

  // TODO delete per network, blocked by web-api
  @Step({
    name: 'Delete all accounts'
  })
  @Catch({
    displayMessage: 'Failed to delete all accounts'
  })
  async deleteAllAccounts(): Promise<void> {
    const supportedNetworks = [config.TESTNET_NETWORK, config.env.MAINNET_NETWORK];
    // eslint-disable-next-line no-restricted-syntax
    for (const network of supportedNetworks) {
      Connection.db(this.storePrefix).set('network', network);
      // eslint-disable-next-line no-await-in-loop
      await this.walletService.createWallet();
      // eslint-disable-next-line no-await-in-loop
      await this.keyVaultService.updateVaultStorage();
    }
    await this.delete();
  }

  @Step({
    name: 'Recover accounts'
  })
  @Catch({
    showErrorMessage: true
  })
  async recoverAccounts({ inputData }: { inputData?: any }): Promise<void> {
    const accounts = await this.get();
    const uniqueNetworks = [...new Set(accounts.map(acc => acc.network))];
    // eslint-disable-next-line no-restricted-syntax
    for (const network of uniqueNetworks) {
      // eslint-disable-next-line no-continue
      if (network === 'test') continue;
      Connection.db(this.storePrefix).set('network', network);
      const networkAccounts = accounts
        .filter(acc => acc.network === network)
        .sort((a, b) => a.name.split('-')[1] - b.name.split('-')[1]);

        const lastIndex = networkAccounts[networkAccounts.length - 1].name.split('-')[1];
        // IN SEEDLESS NETWORK PRIVATE KEY CONTAINS PRIVATE KEYS ONLY FOR SPECIFIC NETWORK OTHERWISE IT CONTAINS THE SEED STRING
        const networkPrivateKeys = typeof (inputData) === 'object' ? inputData[String(network)] : inputData;
        // eslint-disable-next-line no-await-in-loop
        await this.createAccount({ indexToRestore: +lastIndex, inputData: networkPrivateKeys });
    }
  }

  @Catch({
    showErrorMessage: true
  })
  async recovery({mnemonic, password}: Record<string, any>): Promise<void> {
    const seed = await this.keyManagerService.seedFromMnemonicGenerate(mnemonic);
    const accounts = await this.get();
    if (accounts.length === 0) {
      throw new Error('Validators not found');
    }
    const accountToCompareWith = accounts[accounts.length - 1];
    const index = accountToCompareWith.name.split('-')[1];
    const account = await this.keyManagerService.getAccount(seed, index, accountToCompareWith.network);

    if (account[0].validationPubKey !== accountToCompareWith.publicKey.replace(/^(0x)/, '')) {
      throw new Error('Passphrase not linked to your account.');
    }
    Connection.db(this.storePrefix).clear();
    await Connection.db(this.storePrefix).setNewPassword(password, false);
    Connection.db(this.storePrefix).set('seed', seed);
  }
}
