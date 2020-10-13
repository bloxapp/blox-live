import Store from '../../common/store-manager/store';
import BloxApi from '../../common/communication-manager/blox-api';
import { METHOD } from '../../common/communication-manager/constants';
import { Catch, CatchClass, Step } from '../../decorators';
import KeyVaultService from '../key-vault/key-vault.service';
import KeyManagerService from '../key-manager/key-manager.service';
import Web3 from 'web3';
import WalletService from '../wallet/wallet.service';
import config from '../../common/config';

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
    const index: number = await this.getNextIndex();
    const lastIndexedAccount = await this.keyManagerService.getAccount(this.store.get('seed'), index);
    lastIndexedAccount['network'] = network;
    const account = await this.create(lastIndexedAccount);
    if (account.error && account.error instanceof Error) return;
    this.store.set(`index.${network}`, index.toString());
    return { data: account };
  }

  @Step({
    name: 'Create Account',
    requiredConfig: ['seed', 'network']
  })
  @Catch({
    displayMessage: 'CLI Create Account failed'
  })
  async createAccount(): Promise<void> {
    const network = this.store.get('network');
    const index: number = await this.getNextIndex();
    const storage = await this.keyManagerService.createAccount(this.store.get('seed'), index);
    this.store.set(`keyVaultStorage.${network}`, storage);
  }

  async getNextIndex(): Promise<number> {
    const network = this.store.get('network');
    if (!network) {
      throw new Error('Configuration settings network not found');
    }
    const index = this.store.get(`index.${network}`);
    let nextIndex = 0;
    if (index) {
      nextIndex = +index + 1;
    } else if (this.store.get(`keyVaultStorage.${network}`)) {
      const lastIndexedAccount = await this.getLastIndexedAccount();
      if (lastIndexedAccount) {
        const lastIndex = +lastIndexedAccount.name.replace('account-', '');
        this.store.set(`index.${network}`, lastIndex.toString());
        nextIndex = lastIndex + 1;
      } else {
        this.store.set(`index.${network}`, (nextIndex - 1).toString());
      }
    }
    return nextIndex;
  }

  async listAccounts(): Promise<any> {
    const network = this.store.get('network');
    if (!network) {
      throw new Error('Configuration settings network not found');
    }
    return await this.keyManagerService.listAccounts(this.store.get(`keyVaultStorage.${network}`));
  }

  async getLastIndexedAccount(): Promise<any> {
    const accounts = await this.listAccounts();
    if (accounts && accounts.length) {
      console.log('account', accounts[0]);
      return accounts[0];
    }
  }

  async getDepositData(pubKey: string, index: number, network: string = config.env.TEST_NETWORK): Promise<any> {
    if (!pubKey) {
      throw new Error('publicKey is empty');
    }
    const publicKeyWithoutPrefix = pubKey.replace(/^(0x)/, '');
    const depositData = await this.keyManagerService.getDepositData(this.store.get('seed'), index, publicKeyWithoutPrefix, network);
    const {
      publicKey,
      withdrawalCredentials,
      signature,
      depositDataRoot
    } = depositData;

    const depositContractABI = require('./deposit_abi.json');
    const depositTo = network === config.env.TEST_NETWORK ? '0x07b39F4fDE4A38bACe212b546dAc87C58DfE3fDC' : '0x99F0Ec06548b086E46Cb0019C78D0b9b9F36cD53';
    const web3 = new Web3(
      'https://goerli.infura.io/v3/d03b92aa81864faeb158166231b7f895'
    );
    const depositContract = new web3.eth.Contract(depositContractABI, depositTo);
    const depositMethod = depositContract.methods.deposit(
      `0x${publicKey}`,
      `0x${withdrawalCredentials}`,
      `0x${signature}`,
      `0x${depositDataRoot}`
    );

    const data = depositMethod.encodeABI();
    console.log(data);
    return data;
  }

  async deleteLastIndexedAccount(): Promise<void> {
    const network = this.store.get('network');
    if (!network) {
      throw new Error('Configuration settings network not found');
    }
    const index: number = await this.getNextIndex() - 2;
    const storage = index <= 0 ? await this.keyManagerService.createWallet() : await this.keyManagerService.createAccount(this.store.get('seed'), index);
    this.store.set(`keyVaultStorage.${network}`, storage);
    this.store.set(`index.${network}`, index.toString());
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
      for (const [network, storage] of Object.entries(keyVaultStorage)) {
        if (storage) {
          this.store.set('network', network);
          await this.walletService.createWallet();
          await this.keyVaultService.updateVaultStorage();
          this.store.delete(`index.${network}`);
        }
      }
    }
    await this.delete();
  }
}
