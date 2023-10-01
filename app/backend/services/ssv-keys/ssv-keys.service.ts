import { SSVKeys, KeyShares } from 'ssv-keys';

import { Log } from '~app/backend/common/logger/logger';

export default class SsvKeysService {
  private logger: Log;

  constructor() {
    this.logger = new Log(SsvKeysService.name);
  }

  async extractKeysFromKeystore(keystore: any, keystorePassword: string): Promise<any> {
    // Initialize SSVKeys SDK
    const ssvKeys = new SSVKeys();
    const { publicKey, privateKey } = await ssvKeys.extractKeys(keystore, keystorePassword);
    // Return extracted keys
    return {
      publicKey,
      privateKey,
    };
  }

  async buildKeyShares(publicKey: string, privateKey: string, operators: any, ownerAddress: string, ownerNonce: number): Promise<any> {
    // Initialize SSVKeys SDK
    const ssvKeys = new SSVKeys();

    // Build shares from operator IDs and public keys
    const encryptedShares = await ssvKeys.buildShares(privateKey, operators);

    const keyShares = new KeyShares();
    await keyShares.update({
      operators,
      ownerAddress,
      ownerNonce,
      publicKey
    });

    // Build final web3 transaction payload and update keyshares file with payload data
    await keyShares.buildPayload({
      publicKey,
      operators,
      encryptedShares,
    }, {
      ownerAddress,
      ownerNonce,
      privateKey
    });

    this.logger.info('Key shares successfully built');
    return keyShares.toJson();
  }
}
