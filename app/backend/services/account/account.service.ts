import Connection from '../../common/store-manager/connection';
import BloxApi from '../../common/communication-manager/blox-api';
import BeaconchaApi from '../../common/communication-manager/beaconcha-api';
import { METHOD } from '../../common/communication-manager/constants';
import { Catch, CatchClass, Step } from '../../decorators';
import KeyVaultService from '../key-vault/key-vault.service';
import KeyManagerService from '../key-manager/key-manager.service';
import Web3 from 'web3';
import WalletService from '../wallet/wallet.service';
import config from '../../common/config';
import { hexDecode } from '../../../utils/service';
import { Logger } from '../../common/logger/logger';

// @CatchClass<AccountService>()
export default class AccountService {
  private readonly walletService: WalletService;
  private readonly keyVaultService: KeyVaultService;
  private readonly keyManagerService: KeyManagerService;
  private readonly bloxApi: BloxApi;
  private readonly beaconchaApi: BeaconchaApi;
  private storePrefix: string;

  constructor(prefix: string = '') {
    this.storePrefix = prefix;
    this.walletService = new WalletService();
    this.keyVaultService = new KeyVaultService();
    this.keyManagerService = new KeyManagerService();
    this.bloxApi = new BloxApi();
    this.bloxApi.init();

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
    const logger = new Logger();
    if (payload.public_keys.length === 0) return {};
    try {
      this.beaconchaApi.init(payload.network);
      const generalData = await this.bloxApi.request(METHOD.POST, 'ethereum2/highest-attestation', payload);
      const beaconchaData = await this.beaconchaApi.request(METHOD.GET, 'block/latest');
      const keyManagerData = await this.keyManagerService.getAttestation(payload.network);
      console.warn('getHighestAttestation: raw answers', generalData, beaconchaData, keyManagerData);
      logger.debug(`getHighestAttestation: raw answers > ${JSON.stringify({ generalData, beaconchaData, keyManagerData })}`);
      Object.keys(generalData).forEach(key => {
        const {
          highest_source_epoch: bloxSourceEpoch,
          highest_target_epoch: bloxTargetEpoch,
          highest_proposal_slot: bloxSlot
        } = generalData[key];
        const { slot: beaconchaSlot, epoch: beaconchaEpoch } = beaconchaData?.data;
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
      console.warn('getHighestAttestation: result', generalData);
      logger.debug(`getHighestAttestation: selected > ${JSON.stringify(generalData)}`);
      return generalData;
    } catch (e) {
      if (retries === 0) {
        throw e;
      }
      console.warn('getHighestAttestation: fails, retry...', e);
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

  @Step({
    name: 'Create Blox Account'
  })
  @Catch({
    displayMessage: 'Create Blox Account failed'
  })
  async createBloxAccount(): Promise<any> {
    const network = Connection.db(this.storePrefix).get('network');
    const index: number = +Connection.db(this.storePrefix).get(`index.${network}`) + 1;
    const lastIndexedAccount = await this.keyManagerService.getAccount(Connection.db(this.storePrefix).get('seed'), index, network);
    lastIndexedAccount.network = network;
    const account = await this.create(lastIndexedAccount);
    if (account.error && account.error instanceof Error) return;
    return { data: account };
  }

  @Step({
    name: 'Create Account'
  })
  @Catch({
    displayMessage: 'CLI Create Account failed'
  })
  async createAccount(getNextIndex = true, indexToRestore = 0): Promise<void> {
    const network = Connection.db(this.storePrefix).get('network');
    const index: number = getNextIndex ? await this.getNextIndex(network) : indexToRestore;
    // 1. get public-keys to create
    const accounts = await this.keyManagerService.getAccount(Connection.db(this.storePrefix).get('seed'), index, network, true);
    const accountsHash = Object.assign({}, ...accounts.map(account => ({ [account.validationPubKey]: account })));
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
      if (slashingData && slashingData.hasOwnProperty(key)) {
        const decodedValue = hexDecode(slashingData[key]);
        const decodedValueJson = JSON.parse(decodedValue);
        const highestAttestation = {
          'highest_source_epoch': decodedValueJson?.HighestAttestation?.source?.epoch,
          'highest_target_epoch': decodedValueJson?.HighestAttestation?.target?.epoch,
          'highest_proposal_slot': decodedValueJson?.HighestProposal?.slot,
        };
        accountsHash[key] = { ...accountsHash[key], ...highestAttestation };
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
      accountsHash[key] = { ...accountsHash[key], ...value };
    }

    let highestSource = '';
    let highestTarget = '';
    let highestProposal = '';
    const accountsArray = Object.values(accountsHash);
    for (let i = index; i >= 0; i -= 1) {
      highestSource += `${accountsArray[i]['highest_source_epoch']}${i === 0 ? '' : ','}`;
      highestTarget += `${accountsArray[i]['highest_target_epoch']}${i === 0 ? '' : ','}`;
      highestProposal += `${accountsArray[i]['highest_proposal_slot']}${i === 0 ? '' : ','}`;
    }

    // 6. create accounts
    const storage = await this.keyManagerService.createAccount(Connection.db(this.storePrefix).get('seed'), index, network, highestSource, highestTarget, highestProposal);
    Connection.db(this.storePrefix).set(`keyVaultStorage.${network}`, storage);
  }

  @Step({
    name: 'Restore Accounts'
  })
  @Catch({
    displayMessage: 'CLI Create Account failed'
  })
  async restoreAccounts(): Promise<void> {
    const indices = Connection.db(this.storePrefix).get('index');
    if (indices) {
      // eslint-disable-next-line no-restricted-syntax
      for (const [network, lastIndex] of Object.entries(indices)) {
        const index = +lastIndex;
        if (index > -1) {
          Connection.db(this.storePrefix).set('network', network);
          // eslint-disable-next-line no-await-in-loop
          await this.createAccount(false, index);
        }
      }
    }
  }

  async getNextIndex(network: string): Promise<number> {
    let index = 0;
    console.log('try getIndex...');
    const accounts = await this.keyVaultService.listAccounts();
    console.log('=getnextindex', accounts);
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
      coin
    };
  }

  @Step({
    name: 'Delete Last Indexed Account'
  })
  async deleteLastIndexedAccount(): Promise<void> {
    const network = Connection.db(this.storePrefix).get('network');
    if (!network) {
      throw new Error('Configuration settings network not found');
    }
    const index: number = +Connection.db(this.storePrefix).get(`index.${network}`);
    console.log('----delete', index);
    if (index < 0) {
      await this.walletService.createWallet();
    } else {
      await this.createAccount(false, index);
    }
  }

  // TODO delete per network, blocked by web-api
  async deleteAllAccounts(): Promise<void> {
    const supportedNetworks = [config.env.PYRMONT_NETWORK, config.env.MAINNET_NETWORK];
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
  async recoverAccounts(): Promise<void> {
    const accounts = await this.get();
    const uniqueNetworks = [...new Set(accounts.map(acc => acc.network))];
    // eslint-disable-next-line no-restricted-syntax
    for (const network of uniqueNetworks) {
      if (network === 'test') continue;
      Connection.db(this.storePrefix).set('network', network);
      const networkAccounts = accounts
        .filter(acc => acc.network === network)
        .sort((a, b) => a.name.localeCompare(b.name));

      const lastIndex = networkAccounts[networkAccounts.length - 1].name.split('-')[1];
      await this.createAccount(false, +lastIndex);
    }
  }

  @Catch({
    showErrorMessage: true
  })
  async recovery({ mnemonic, password }: Record<string, any>): Promise<void> {
    const seed = await this.keyManagerService.seedFromMnemonicGenerate(mnemonic);
    const accounts = await this.get();
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
}
