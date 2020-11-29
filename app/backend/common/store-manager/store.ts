import * as crypto from 'crypto';
import ElectronStore from 'electron-store';
import BaseStore from './base-store';
import { Logger } from '../logger/logger';
import { Catch, Step } from '../../decorators';
import { Migrate } from '../../migrate';

// TODO import from .env
const tempStorePrefix = 'tmp';

export default class Store extends BaseStore {
  private static instances: any = {};
  private storage: ElectronStore;
  private readonly prefix: string;
  private readonly encryptedKeys: Array<string> = ['keyPair', 'seed', 'credentials', 'vaultRootToken'];
  private readonly cryptoAlgorithm: string = 'aes-256-ecb';
  private cryptoKey: string;
  private cryptoKeyTTL: number = 20; // 20 minutes
  private timer: any;
  private logger: Logger;

  private constructor(prefix: string = '') {
    super();
    this.prefix = prefix;
    this.logger = new Logger();
  }

  static getStore = (prefix: string = '') => {
    if (!Store.instances[prefix]) {
      let configStore = new Store(prefix);
      const env = configStore.baseStore.get('env');
      if (env && env !== 'production') {
        configStore = new Store(`${env}${prefix}`);
      }
      Store.instances[prefix] = configStore;
      // Temp solution to init prefix storage
      if (prefix && !Store.instances[prefix].storage && Store.instances['']) {
        const userId = Store.instances[''].get('currentUserId');
        const authToken = Store.instances[''].get('authToken');
        // eslint-disable-next-line prefer-destructuring
        const cryptoKey = Store.instances[''].cryptoKey;
        if (cryptoKey) {
          Store.instances[prefix].cryptoKey = cryptoKey;
        }
        Store.instances[prefix].init(userId, authToken);
      }
    }
    return Store.instances[prefix];
  };

  static close = (prefix: string = '') => {
    Store.instances[prefix] = undefined;
  };

  static isExist = (prefix: string = '') => {
    return !!Store.instances[prefix];
  };

  init = (userId: string, authToken: string, oldPattern?: boolean): any => {
    if (!userId) {
      throw new Error('Store not ready to be initialised, currentUserId is missing');
    }
    let currentUserId = userId;
    this.baseStore.set('currentUserId', currentUserId);
    this.baseStore.set('authToken', authToken);
    if (!oldPattern) {
      currentUserId = currentUserId.replace(/[/\\:*?"<>|]/g, '-');
    }
    const storeName = `${this.baseStoreName}${currentUserId ? `-${currentUserId}` : ''}${this.prefix ? `-${this.prefix}` : ''}`;
    this.storage = new ElectronStore({ name: storeName });
  };

  setEnv = (env: string): any => {
    this.baseStore.set('env', env);
  };

  deleteEnv = (): any => {
    this.baseStore.delete('env');
  };

  isEncryptedKey = (key: string): boolean => {
    const keyToCheck = key.replace(/\..*/, '.*');
    return this.encryptedKeys.includes(keyToCheck);
  };

  exists = (key: string): boolean => {
    const value = (this.storage && this.storage.get(key)) || this.baseStore.get(key);
    return !!value;
  };

  get = (key: string): any => {
    const value = (this.storage && this.storage.get(key)) || this.baseStore.get(key);
    if (value && this.isEncryptedKey(key)) {
      if (!this.cryptoKey) {
        throw new Error('Crypto key is null');
      }
      try {
        return this.decrypt(this.cryptoKey, value);
      } catch (e) {
        this.set(key, value);
      }
    }
    return value;
  };

  all = () : any => {
    return this.storage.store;
  };

  set = (key: string, value: any, noCrypt? : boolean): void => {
    if (value === undefined) {
      return;
    }
    if (this.isEncryptedKey(key) && !noCrypt) {
      if (!this.cryptoKey) {
        throw new Error('Crypto key is null');
      }
      this.storage.set(key, this.encrypt(this.cryptoKey, value));
    } else {
      this.storage
        ? this.storage.set(key, value)
        : this.baseStore.set(key, value);
    }
  };

  setMultiple = (params: any, noCrypt?: boolean): void => {
    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of Object.entries(params)) {
      this.set(key, value, noCrypt);
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
    // this.cryptoKey = undefined;
    // Object.keys(Store.instances).forEach(prefix => Store.close(prefix));
  };

  isCryptoKeyStored = () => !!this.cryptoKey;

  @Catch()
  createCryptoKey(cryptoKey: string) {
    return crypto.createHash('sha256').update(String(cryptoKey)).digest('base64').substr(0, 32);
  }

  @Catch()
  unsetCryptoKey() {
    this.logger.error('unsetCryptoKey');
    this.cryptoKey = null;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  encrypt(cryptoKey: string, value: string): any {
    const str = Buffer.from(JSON.stringify(value)).toString('base64');
    const cipher = crypto.createCipheriv(this.cryptoAlgorithm, cryptoKey, null);
    const encrypted = Buffer.concat([cipher.update(str), cipher.final()]);
    return encrypted.toString('hex');
  }

  decrypt(cryptoKey: string, value: any): any {
    const decipher = crypto.createDecipheriv(this.cryptoAlgorithm, cryptoKey, null);
    const encryptedText = Buffer.from(value, 'hex');
    const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
    return JSON.parse(Buffer.from(decrypted.toString(), 'base64').toString('ascii'));
  }

  @Catch()
  async setCryptoKey(cryptoKey: string) {
    // clean timer which was run before, and run new one
    this.unsetCryptoKey();
    this.logger.error('setCryptoKey');
    this.cryptoKey = this.createCryptoKey(cryptoKey);
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    this.timer = setTimeout(this.unsetCryptoKey.bind(this), this.cryptoKeyTTL * 1000 * 60);
    // run migrations if exists
    await Migrate.runCrypted(this.get('currentUserId'), this.storage.get('env'));
  }

  @Catch()
  async setNewPassword(cryptoKey: string, backup: boolean = true) {
    const oldDecryptedKeys = {};
    if (backup) {
      if (!this.cryptoKey) {
        await this.setCryptoKey('temp');
      }
      this.encryptedKeys.forEach((encryptedKey) => {
        // TODO handle encrypted objects
        if (this.exists(encryptedKey)) {
          oldDecryptedKeys[encryptedKey] = this.get(encryptedKey);
        }
      });
    }
    await this.setCryptoKey(cryptoKey);
    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of Object.entries(oldDecryptedKeys)) {
      this.set(key, value);
    }
  }

  @Catch()
  async isCryptoKeyValid(password: string) {
    const userInputCryptoKey = await this.createCryptoKey(password);
    const encryptedSavedCredentials = await this.storage.get('credentials');
    try {
      const decryptedValue = await this.decrypt(userInputCryptoKey, encryptedSavedCredentials);
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
      slashingData: store.get('slashingData'),
      index: store.get('index'),
      seed: store.get('seed')
    });
    store.delete('slashingData');
    store.delete('index');
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
