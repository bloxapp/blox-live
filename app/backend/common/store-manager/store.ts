import * as crypto from 'crypto';
import ElectronStore from 'electron-store';
import BaseStore from './base-store';
import { Logger } from '../logger/logger';
import { Catch, Step } from '../../decorators';

// TODO import from .env
const tempStorePrefix = 'tmp';

export default class Store extends BaseStore {
  private static instances: any = {};
  private storage: ElectronStore;
  private readonly prefix: string;
  private readonly encryptedKeys: Array<string> = ['keyPair', 'seed', 'credentials', 'vaultRootToken'];
  private readonly cryptoAlgorithm: string = 'aes-256-ecb';
  private cryptoKey: string;
  private cryptoKeyTTL: number = 15; // 15 minutes
  private timer: any;
  private logger: Logger;

  private constructor(prefix: string = '') {
    super();
    this.prefix = prefix;
    this.logger = new Logger();
  }

  static getStore = (prefix: string = '') => {
    if (!Store.instances[prefix]) {
      console.log('USE EXISTED STORE', prefix);
      Store.instances[prefix] = new Store(prefix);
      // Temp solution to init prefix storage
      if (prefix && !Store.instances[prefix].storage && Store.instances['']) {
        const userId = Store.instances[''].get('currentUserId');
        const authToken = Store.instances[''].get('authToken');
        Store.instances[prefix].init(userId, authToken);
      }
    }
    return Store.instances[prefix];
  };

  static isExist = (prefix: string = '') => {
    return !!Store.instances[prefix];
  };

  init = (userId: string, authToken: string): any => {
    if (!userId) {
      throw new Error('Store not ready to be initialised, currentUserId is missing');
    }
    this.baseStore.set('currentUserId', userId);
    this.baseStore.set('authToken', authToken);
    const storeName = `${this.baseStoreName}${userId ? `-${userId}` : ''}${this.prefix ? `-${this.prefix}` : ''}`;
    this.storage = new ElectronStore({ name: storeName });
  };

  setEnv = (env: string): any => {
    this.baseStore.set('env', env);
  };

  deleteEnv = (): any => {
    this.baseStore.delete('env');
  };

  get = (key: string): any => {
    const value = (this.storage && this.storage.get(key)) || this.baseStore.get(key);
    if (this.cryptoKey && value && this.encryptedKeys.includes(key)) {
      return this.decrypt(this.cryptoKey, value);
    }
    return value;
  };

  set = (key: string, value: any): void => {
    if (this.cryptoKey && value && this.encryptedKeys.includes(key)) {
      this.storage.set(key, this.encrypt(this.cryptoKey, value));
    } else {
      this.storage.set(key, value);
    }
  };

  setMultiple = (params: any): void => {
    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of Object.entries(params)) {
      this.set(key, value);
    }
  };

  delete = (key: string): void => {
    this.storage.delete(key);
  };

  clear = (): void => {
    this.storage.clear();
  };

  logout = (): void => {
    this.baseStore.clear();
  };

  @Catch()
  createCryptoKey(cryptoKey: string) {
    return crypto.createHash('sha256').update(String(cryptoKey)).digest('base64').substr(0, 32);
  }

  @Catch()
  unsetCryptoKey() {
    console.log('UNSET crypto key');
    this.logger.error('unsetCryptoKey');
    this.cryptoKey = null;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  @Catch()
  encrypt(cryptoKey: string, value: string): any {
    const str = Buffer.from(JSON.stringify(value)).toString('base64');
    const cipher = crypto.createCipheriv(this.cryptoAlgorithm, cryptoKey, null);
    const encrypted = Buffer.concat([cipher.update(str), cipher.final()]);
    return encrypted.toString('hex');
  }

  @Catch()
  decrypt(cryptoKey: string, value: any): any {
    const decipher = crypto.createDecipheriv(this.cryptoAlgorithm, cryptoKey, null);
    const encryptedText = Buffer.from(value, 'hex');
    const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
    return JSON.parse(Buffer.from(decrypted.toString(), 'base64').toString('ascii'));
  }

  @Catch()
  setCryptoKey(cryptoKey: string) {
    // clean timer which was run before, and run new one
    this.unsetCryptoKey();
    this.cryptoKey = this.createCryptoKey(cryptoKey);
    this.logger.error('setCryptoKey');
    this.timer = setTimeout(this.unsetCryptoKey, this.cryptoKeyTTL * 60 * 1000);
  }

  @Catch()
  setNewPassword(cryptoKey: string) {
    const oldDecryptedKeys = {};
    this.encryptedKeys.forEach((encryptedKey) => {
      oldDecryptedKeys[encryptedKey] = this.get(encryptedKey);
    });
    this.setCryptoKey(cryptoKey);
    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of Object.entries(oldDecryptedKeys)) {
      this.set(key, value);
    }
  }

  @Catch()
  isCryptoKeyValid(password: string) {
    const userInputCryptoKey = this.createCryptoKey(password);
    const encryptedSavedCredentials = this.storage.get('credentials');
    try {
      const decryptedValue = this.decrypt(userInputCryptoKey, encryptedSavedCredentials);
      return !!decryptedValue;
    } catch (e) {
      return false;
    }
  }

  @Step({
    name: 'Creating local backup...'
  })
  @Catch()
  prepareTmpStorageConfig(): void {
    const tmpStore: Store = Store.getStore(tempStorePrefix);
    const store: Store = Store.getStore();
    tmpStore.setMultiple({
      uuid: store.get('uuid'),
      credentials: store.get('credentials'),
      keyPair: store.get('keyPair'),
      securityGroupId: store.get('securityGroupId'),
      keyVaultStorage: store.get('keyVaultStorage'),
      slashingData: store.get('slashingData')
    });
    store.delete('slashingData');
  }

  @Step({
    name: 'Configuring local storage...'
  })
  @Catch()
  saveTmpConfigIntoMain(): void {
    const tmpStore: Store = Store.getStore(tempStorePrefix);
    const store: Store = Store.getStore();
    store.setMultiple({
      uuid: tmpStore.get('uuid'),
      addressId: tmpStore.get('addressId'),
      publicIp: tmpStore.get('publicIp'),
      instanceId: tmpStore.get('instanceId'),
      vaultRootToken: tmpStore.get('vaultRootToken'),
      keyVaultVersion: tmpStore.get('keyVaultVersion'),
      keyVaultStorage: tmpStore.get('keyVaultStorage')
    });
    tmpStore.clear();
  }
}
