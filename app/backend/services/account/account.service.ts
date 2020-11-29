import Store from '../../common/store-manager/store';
import BloxApi from '../../common/communication-manager/blox-api';
import { METHOD } from '../../common/communication-manager/constants';
import { Catch, CatchClass, Step } from '../../decorators';
import KeyVaultService from '../key-vault/key-vault.service';
import KeyManagerService from '../key-manager/key-manager.service';
import Web3 from 'web3';
import WalletService from '../wallet/wallet.service';
import config from '../../common/config';
import { hexDecode } from '../../../utils/service';

@CatchClass<AccountService>()
export default class AccountService {
  private readonly store: Store;
  private readonly walletService: WalletService;
  private readonly keyVaultService: KeyVaultService;
  private readonly keyManagerService: KeyManagerService;

  constructor(storePrefix: string = '') {
    this.store = Store.getStore(storePrefix);
    this.walletService = new WalletService();
    this.keyVaultService = new KeyVaultService();
    this.keyManagerService = new KeyManagerService();
  }

  async get() {
    return await BloxApi.request(METHOD.GET, 'accounts');
  }

  async create(payload: any) {
    return await BloxApi.request(METHOD.POST, 'accounts', payload);
  }

  async delete() {
    return await BloxApi.request(METHOD.DELETE, 'accounts');
  }

  async getHighestAttestation(payload: any) {
    return await BloxApi.request(METHOD.POST, 'ethereum2/highest-attestation', payload);
  }

  async updateStatus(route: string, payload: any) {
    if (!route) {
      throw new Error('route');
    }
    return await BloxApi.request(METHOD.PATCH, `accounts/${route}`, payload);
  }

  @Step({
    name: 'Create Blox Account',
    requiredConfig: ['seed', 'authToken', 'network']
  })
  @Catch({
    displayMessage: 'Create Blox Account failed'
  })
  async createBloxAccount(): Promise<any> {
    const network = this.store.get('network');
    const index: number = +this.store.get(`index.${network}`) + 1;
    const lastIndexedAccount = await this.keyManagerService.getAccount(this.store.get('seed'), index);
    lastIndexedAccount['network'] = network;
    const account = await this.create(lastIndexedAccount);
    if (account.error && account.error instanceof Error) return;
    return { data: account };
  }

  @Step({
    name: 'Create Account',
    requiredConfig: ['seed', 'network']
  })
  @Catch({
    displayMessage: 'CLI Create Account failed'
  })
  async createAccount({ network, getNextIndex = true, indexToRestore = 0, getRemoteSlashingData = true }): Promise<void> {
    const index: number = getNextIndex ? await this.getNextIndex(network) : indexToRestore;

    // 1. get public-keys to create
    const accounts = await this.keyManagerService.getAccount(this.store.get('seed'), index, true);
    const accountsHash = Object.assign({}, ...accounts.map(account => ({ [account.validationPubKey]: account })));
    const publicKeysToGetHighestAttestation = [];

    // 2. get slashing data if exists
    const slashingData = getRemoteSlashingData ? await this.keyVaultService.getSlashingStorage() : this.store.get(`slashingData.${network}`);

    // 3. update accounts-hash from exist slashing storage
    for (const key of Object.keys(accountsHash)) {
      if (slashingData.hasOwnProperty(key)) {
        const decodedValue = hexDecode(slashingData[key]);
        const decodedValueJson = JSON.parse(decodedValue);
        const highestAttestation = {
          'highest_source_epoch': decodedValueJson?.HighestAttestation?.source?.epoch,
          'highest_target_epoch': decodedValueJson?.HighestAttestation?.target?.epoch
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
    for (const [key, value] of Object.entries(highestAttestationsMap)) {
      accountsHash[key] = { ...accountsHash[key], ...value };
    }

    let highestSource = '';
    let highestTarget = '';
    const accountsArray = Object.values(accountsHash);
    for (let i = index; i >= 0; i--) {
      highestSource += `${accountsArray[i]['highest_source_epoch']}${i === 0 ? '' : ','}`;
      highestTarget += `${accountsArray[i]['highest_target_epoch']}${i === 0 ? '' : ','}`;
    }
    console.log(highestSource);
    console.log(highestTarget);

    // 6. create accounts
    const storage = await this.keyManagerService.createAccount(this.store.get('seed'), index, highestSource, highestTarget);
    this.store.set(`keyVaultStorage.${network}`, storage);
  }

  @Step({
    name: 'Restore Accounts'
  })
  @Catch({
    displayMessage: 'CLI Create Account failed'
  })
  async restoreAccounts(): Promise<void> {
    const indices = this.store.get('index');
    if (indices) {
      // eslint-disable-next-line no-restricted-syntax
      for (const [network, lastIndex] of Object.entries(indices)) {
        const index = +lastIndex;
        if (index > -1) {
          // this.store.set('network', network);
          this.createAccount({ network, getNextIndex: false, indexToRestore: index, getRemoteSlashingData: false });
        }
      }
    }
  }

  async getNextIndex(network: string): Promise<number> {
    let index = 0;
    const accounts = await this.keyVaultService.listAccounts();
    if (accounts.length) {
      index = +accounts[0].name.replace('account-', '') + 1;
    }
    this.store.set(`index.${network}`, (index - 1).toString());
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
    const depositData = await this.keyManagerService.getDepositData(this.store.get('seed'), index, publicKeyWithoutPrefix, network);
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
      txHash: data,
      network,
      accountIndex: index,
      publicKey,
      depositTo: depositContractAddress,
      coin
    };
  }

  async deleteLastIndexedAccount(): Promise<void> {
    const network = this.store.get('network');
    if (!network) {
      throw new Error('Configuration settings network not found');
    }
    const index: number = +this.store.get(`index.${network}`);
    const storage = index < 0 ? await this.keyManagerService.createWallet() : await this.keyManagerService.createAccount(this.store.get('seed'), index);
    this.store.set(`keyVaultStorage.${network}`, storage);
  }

  async generatePublicKeys(): Promise<void> {
    const results = [];
    for (let i = 0; i < 10; i += 1) {
      results.push(this.keyManagerService.generatePublicKey(this.store.get('seed'), i));
    }
    await Promise.all(results);
  }

  async deleteAllAccounts(): Promise<void> {
    const keyVaultStorage = this.store.get('keyVaultStorage');
    this.store.delete('keyVaultStorage');

    if (keyVaultStorage) {
      // eslint-disable-next-line no-restricted-syntax
      for (const [network, storage] of Object.entries(keyVaultStorage)) {
        if (storage) {
          this.store.set('network', network);
          // eslint-disable-next-line no-await-in-loop
          await this.walletService.createWallet();
          // eslint-disable-next-line no-await-in-loop
          await this.keyVaultService.updateVaultStorage();
          this.store.delete(`index.${network}`);
        }
      }
    }
    await this.delete();
  }

  @Step({
    name: 'Validate passphrase and accounts'
  })
  @Catch({
    showErrorMessage: true
  })
  async recoveryAccounts(): Promise<void> {
    const accounts = await this.get();
    const uniqueNetworks = [...new Set(accounts.map(acc => acc.network))];
    // eslint-disable-next-line no-restricted-syntax
    for (const network of uniqueNetworks) {
      const networkAccounts = accounts
        .filter(acc => acc.network === network)
        .sort((a, b) => a.name.localeCompare(b.name));
      /*
      !!! validation names: account-x starts from 0 1 2 throw
      !!! turn off validation temprary till import and delete account logic
      networkAccounts.reduce((aggr, item) => {
        const idx = +item.name.split('-')[1];
        if (idx === 0) return aggr;
        if (idx - 1 !== aggr) throw new Error('account indexes numeration is broken');
        // eslint-disable-next-line no-param-reassign
        aggr = idx;
        return aggr;
      }, 0);
      */
      const lastIndex = networkAccounts[networkAccounts.length - 1].name.split('-')[1];
      // eslint-disable-next-line no-await-in-loop
      const networkStorage = await this.keyManagerService.createAccount(this.store.get('seed'), lastIndex);
      this.store.set(`keyVaultStorage.${network}`, networkStorage);
    }
  }

  @Catch({
    showErrorMessage: true
  })
  async recovery({ mnemonic, password }: Record<string, any>): Promise<void> {
    const seed = await this.keyManagerService.seedFromMnemonicGenerate(mnemonic);
    const defAccountIndex = 0;
    const accounts = await this.get();
    if (accounts.length === 0) {
      throw new Error('Validators not found');
    }

    const index = accounts[defAccountIndex].name.split('-')[1];
    const storage = await this.keyManagerService.createAccount(seed, index);
    const tmpStorageAccounts = await this.keyManagerService.listAccounts(storage);
    const createdAccount = tmpStorageAccounts.find(rec => rec.name === `account-${index}`);
    if (createdAccount.validationPubKey !== accounts[defAccountIndex].publicKey.split('x')[1]) {
      throw new Error('Passphrase not linked to your account.');
    }

    this.store.clear();
    await this.store.setNewPassword(password, false);
    this.store.set('seed', seed);
  }
}
