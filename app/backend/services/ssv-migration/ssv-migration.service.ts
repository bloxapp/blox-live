import * as Bls from 'bls-eth-wasm/browser';

import fs from 'fs';
import path from 'path';
import electron from 'electron';

import SsvApiService from '~app/backend/services/ssv-api/ssvApiService';
import SsvKeysService from '~app/backend/services/ssv-keys/ssv-keys.service';

import { Log } from '~app/backend/common/logger/logger';

type Operator = {
  id: number;
  publicKey: string;
  validatorCount: number;
};

export default class SsvMigrationService {
  private logger: Log;
  private operators: Operator[] = [];
  private ssvKeysService: SsvKeysService;
  private userDataPath: string;
  private ssvApiService: SsvApiService;

  constructor() {
    this.userDataPath = (electron.app || electron.remote.app).getPath('userData');
    this.logger = new Log(SsvMigrationService.name);
    this.ssvKeysService = new SsvKeysService();
    this.ssvApiService = new SsvApiService();
  }

  async init(): Promise<void> {
    // hardcode for now
    const operatorIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    // Get operators data by IDs from ssv-api
    const operatorData: any = await this.ssvApiService.getOperatorsByIds(operatorIds);
    this.operators = operatorData.data.operators.map(operator => ({
      id: operator.id,
      publicKey: operator.public_key,
      validatorCount: operator.validators_count,
    }));
  }

  /*
  It should take operator IDs in such a manner that after all the migration process new validator counts would be more flat
  (with least difference between them)
  On a higher level of the code this object is created from ssv-api call to get list of operators by their ID
  */
  getDistributedOperators(): any {
    // Sorting the operators array based on the validatorCount in ascending order
    this.operators.sort((a, b) => a.validatorCount - b.validatorCount);

    // select the first 4 operators from the sorted array
    const selectedOperators = this.operators.slice(0, 4);

    // increase +1 validatorCount for each of the selected operators
    // eslint-disable-next-line no-return-assign, no-param-reassign
    selectedOperators.forEach(operator => operator.validatorCount += 1);

    return selectedOperators.map(operator => ({ id: operator.id, operatorKey: operator.publicKey }));
  }

  async buildByKeystoresAndPassword(ownerAddress: string, keyStores: any[], password: string): Promise<any> {
    // Get owner nonce from ssv-api
    const ownerData: any = await this.ssvApiService.getAccountData(ownerAddress);
    const { nonce } = ownerData.data.data;

    // Build key shares
    const keySharesList: any[] = [];
    let currentNonce = nonce;
    // eslint-disable-next-line no-restricted-syntax
    for (const keyStore of keyStores) {
      // eslint-disable-next-line no-plusplus
      currentNonce++;
      const operatorsForValidator = this.getDistributedOperators();
      // eslint-disable-next-line no-await-in-loop
      const { publicKey, privateKey } = await this.ssvKeysService.extractKeysFromKeystore(keyStore, password);
      // eslint-disable-next-line no-await-in-loop
      const keyShares = await this.ssvKeysService.buildKeyShares(publicKey, privateKey, operatorsForValidator, ownerAddress, currentNonce);
      keySharesList.push(keyShares);
    }

    this.logger.info('build by keystores completed');
    return keySharesList;
  }

  async buildByPrivateKeys(ownerAddress: string, privateKeys: string[]): Promise<any> {
    await Bls.init(Bls.BLS12_381);

    // Get owner nonce from ssv-api
    const ownerData: any = await this.ssvApiService.getAccountData(ownerAddress);
    console.log(ownerData);
    const { nonce } = ownerData.data.data;

    // Build key shares
    const keySharesList: any[] = [];
    let currentNonce = nonce;
    // eslint-disable-next-line no-restricted-syntax
    for (const privateKey of privateKeys) {
      // eslint-disable-next-line no-plusplus
      currentNonce++;
      const operatorsForValidator = this.getDistributedOperators();
      // eslint-disable-next-line no-await-in-loop
      const publicKey = `0x${Bls.deserializeHexStrToSecretKey(privateKey.replace(/^0x/, '')).getPublicKey().serializeToHexStr()}`;
      // eslint-disable-next-line no-await-in-loop
      const keyShares = await this.ssvKeysService.buildKeyShares(publicKey, `0x${privateKey.replace(/^0x/, '')}`, operatorsForValidator, ownerAddress, currentNonce);
      keySharesList.push(keyShares);
    }

    this.logger.info('build by private keys completed');
    return keySharesList;
  }

  storeKeyShares(keySharesList: any[]): string {
    const outputPath = path.join(this.userDataPath, 'keyshares.json');
    fs.writeFileSync(outputPath, JSON.stringify(keySharesList, null, 2));
    this.logger.info(`build file saved in ${outputPath} file`);
    return outputPath;
  }
}
