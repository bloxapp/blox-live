import Http from './http';

class KeyVaultApi extends Http {
  constructor(storePrefix: string = '') {
    super(storePrefix);
  }

  init = (isNetworkRequired: boolean = true) => {
    let network: string;
    if (isNetworkRequired) {
      network = this.store.get('network');
      if (!network) {
        throw new Error('Configuration settings network not found');
      }
    }
    this.instance.defaults.baseURL = `http://${this.store.get('publicIp')}:8200/v1/${isNetworkRequired ? `ethereum/${network}` : ''}`;
    this.instance.defaults.headers.common['Authorization'] = `Bearer ${this.store.get('vaultRootToken')}`;
  };
}

const keyVaultApi = new KeyVaultApi();

const resolveKeyVaultApi = (storePrefix: string = ''): KeyVaultApi => {
  if (storePrefix) {
    return new KeyVaultApi(storePrefix);
  }
  return keyVaultApi;
};

export {
  keyVaultApi,
  resolveKeyVaultApi,
  KeyVaultApi
};
