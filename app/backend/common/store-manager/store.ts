import fs from 'fs';
import * as crypto from 'crypto';
import ElectronStore from 'electron-store';
import { Migrate } from '~app/backend/migrate';
import { Catch } from '~app/backend/decorators';
import { Log } from '~app/backend/common/logger/logger';
import BaseStore from '~app/backend/common/store-manager/base-store';

export default class Store {
  private storage: ElectronStore;
  private baseStore: BaseStore;
  private readonly prefix: string;
  private readonly encryptedKeys: Array<string> = ['keyPair', 'seed', 'credentials', 'vaultRootToken', 'vaultSignerToken'];
  private readonly cryptoAlgorithm: string = 'aes-256-ecb';
  public cryptoKey: string;
  private cryptoKeyTTL: number = 4 * 60; // 4 hours
  private timer: any;
  private logger: Log;

  constructor(prefix: string = '') {
    this.baseStore = new BaseStore();
    const env = this.baseStore.get('env');
    if (env && env !== 'production') {
      this.prefix = `${env}${prefix}`;
    } else {
      this.prefix = prefix;
    }
    this.logger = new Log('store');
  }

  init(userId: string, tokenData: { authToken: string, refreshToken: string}): void {
    if (!userId) {
      throw new Error('Store not ready to be initialised, currentUserId is missing');
    }
    let currentUserId = userId;
    this.baseStore.set('currentUserId', currentUserId);
    this.baseStore.set('authToken', tokenData.authToken);
    this.baseStore.set('refreshToken', tokenData.refreshToken);
    currentUserId = currentUserId.replace(/[/\\:*?"<>|]/g, '-');
    const storeName = `${this.baseStore.baseStoreName}${currentUserId ? `-${currentUserId}` : ''}${this.prefix ? `-${this.prefix}` : ''}`;
    this.storage = new ElectronStore({ name: storeName });
  }

  setEnv(env: string): any {
    this.baseStore.set('env', env);
  }

  deleteEnv(): any {
    this.baseStore.delete('env');
  }

  isEncryptedKey(key: string): boolean {
    const keyToCheck = key.replace(/\..*/, '.*');
    return this.encryptedKeys.includes(keyToCheck);
  }

  exists(key: string): boolean {
    const value = (this.storage && this.storage.get(key)) || this.baseStore.get(key);
    return !!value;
  }

  get(key: string): any {
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
  }

  all(): any {
    const keys = Object.keys(this.storage.store);
    return keys.reduce((aggr, key) => {
      // eslint-disable-next-line no-param-reassign
      aggr[key] = this.get(key);
      return aggr;
    }, {});
  }

  set(key: string, value: any, noCrypt? : boolean): void {
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
  }

  setMultiple(params: any, noCrypt?: boolean): void {
    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of Object.entries(params)) {
      this.set(key, value, noCrypt);
    }
  }

  delete(key: string): void {
    this.storage.delete(key);
  }

  clear(): void {
    this.storage.clear();
  }

  remove(): void {
    fs.unlinkSync(this.storage.path);
  }

  logout(): void {
    this.baseStore.delete('currentUserId');
    this.baseStore.delete('authToken');
    this.baseStore.delete('refreshToken');
    // this.baseStore.clear();
    // this.cryptoKey = undefined;
    // Object.keys(Store.instances).forEach(prefix => Store.close(prefix));
  }

  isCryptoKeyStored() {
    return !!this.cryptoKey;
  }

  /**
   * Method checks if the password is default temporary or it even doesn't exists.
   */
  shouldSetupPassword() {
    try {
      const encryptedSavedCredentials = this.storage.get('credentials');
      if (!encryptedSavedCredentials) {
        return false;
      }
      const userInputCryptoKey = this.createCryptoKey('temp');
      const decrypted = this.decrypt(userInputCryptoKey, encryptedSavedCredentials);
      return !!decrypted;
    } catch (e) {
      return false;
    }
  }

  @Catch()
  createCryptoKey(cryptoKey: string) {
    return crypto.createHash('sha256').update(String(cryptoKey)).digest('base64').substr(0, 32);
  }

  @Catch()
  unsetCryptoKey() {
    this.logger.info('unsetCryptoKey');
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
    this.logger.info('setCryptoKey');
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

  /*
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
      keyVaultVersion: tmpStore.get('keyVaultVersion')
    });
    tmpStore.clear();
  }
  */
}
