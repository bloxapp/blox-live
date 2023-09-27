import * as Bls from 'bls-eth-wasm/browser';

import axios from 'axios';
import config from '../../common/config';

import { Log } from '~app/backend/common/logger/logger';
import SsvKeysService from '~app/backend/services/ssv-keys/ssv-keys.service';

type Operator = {
  id: number;
  publicKey: string;
  validatorCount: number;
};

export default class MigrationService {
  private logger: Log;
  private ssvKeysService: SsvKeysService;
  private operators: Operator[] = [];

  constructor() {
    this.logger = new Log(MigrationService.name);
    this.ssvKeysService = new SsvKeysService();
  }

  async init(): Promise<void> {
    // hardcode for now
    const operatorIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    // Get operators data by IDs from ssv-api
    const operatorData: any = await axios.post(`${config.env.SSV_API_URL}/operators`, { ids: operatorIds });
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

  async preBuildByKeystoresAndPassword(ownerAddress: string, keyStores: any[], password: string): Promise<any[]> {
    // Get owner nonce from ssv-api
    const ownerData: any = await axios.get(`${config.env.SSV_API_URL}/accounts/${ownerAddress}`);
    const { nonce } = ownerData.data.data;

    // Build key shares
    const keySharesList: any[] = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const keyStore of keyStores) {
      const operatorsForValidator = this.getDistributedOperators();
      // eslint-disable-next-line no-await-in-loop
      const { publicKey, privateKey } = await this.ssvKeysService.extractKeysFromKeystore(keyStore, password);
      // eslint-disable-next-line no-await-in-loop
      const keyShares = await this.ssvKeysService.buildKeyShares(publicKey, privateKey, operatorsForValidator, ownerAddress, nonce);
      keySharesList.push(keyShares);
    }

    this.logger.info('preBuild by keystores completed');
    return keySharesList;
  }

  async preBuildByPrivateKeys(ownerAddress: string, privateKeys: string[]): Promise<any[]> {
    await Bls.init(Bls.BLS12_381);

    // Get owner nonce from ssv-api
    const ownerData: any = await axios.get(`${config.env.SSV_API_URL}/accounts/${ownerAddress}`);
    const { nonce } = ownerData.data;

    // Build key shares
    const keySharesList: any[] = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const privateKey of privateKeys) {
      const operatorsForValidator = this.getDistributedOperators();
      // eslint-disable-next-line no-await-in-loop
      const publicKey = `0x${Bls.deserializeHexStrToSecretKey(privateKey).getPublicKey().serializeToHexStr()}`;
      // eslint-disable-next-line no-await-in-loop
      const keyShares = await this.ssvKeysService.buildKeyShares(`0x${privateKey}`, publicKey, operatorsForValidator, ownerAddress, nonce);
      keySharesList.push(keyShares);
    }

    this.logger.info('preBuild by keystores completed');
    return keySharesList;
  }
}
