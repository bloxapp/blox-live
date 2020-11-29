import Http from './http';
import KeyVaultSsh from './key-vault-ssh';
class KeyVaultApi extends Http {
  private readonly keyVaultSsh: KeyVaultSsh;

  constructor(storePrefix: string = '') {
    super(storePrefix);
    this.keyVaultSsh = new KeyVaultSsh(storePrefix);
  }

  init(isNetworkRequired: boolean = true) {
    let network: string;
    if (isNetworkRequired) {
      network = this.store.get('network');
      if (!network) {
        throw new Error('Configuration settings network not found');
      }
    }
    this.instance.defaults.baseURL = `http://${this.store.get('publicIp')}:8200/v1/${isNetworkRequired ? `ethereum/${network}` : ''}`;
    this.instance.defaults.headers.common['Authorization'] = `Bearer ${this.store.get('vaultRootToken')}`;
  }

  async requestThruSsh({
    method,
    path,
    data = null,
    isNetworkRequired = true
  }): Promise<any> {
    let network: string;
    if (isNetworkRequired) {
      network = this.store.get('network');
      if (!network) {
        throw new Error('Configuration settings network not found');
      }
    }
    const ssh = await this.keyVaultSsh.getConnection();
    const command = this.keyVaultSsh.buildCurlCommand({
      authToken: this.store.get('vaultRootToken'),
      method,
      data,
      route: `https://localhost:8200/v1/${isNetworkRequired ? `ethereum/${network}/` : ''}${path}`
    }, true);
    console.log('curl=', command);
    const { stdout } = await ssh.execCommand(command, {});
    const body = JSON.parse(stdout);
    console.log('curl answer=', body);
    if (body.errors) {
      throw new Error(JSON.stringify(body));
    }
    return body;
  }
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
