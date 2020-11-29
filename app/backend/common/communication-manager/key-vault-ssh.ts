import Store from '../store-manager/store';
import NodeSSH from 'node-ssh';

export default class KeyVaultSsh {
  private readonly store: Store;

  constructor(storePrefix: string = '') {
    this.store = Store.getStore(storePrefix);
  }

  getConnection = async (): Promise<NodeSSH> => {
    const ssh = new NodeSSH();
    const keyPair: any = this.store.get('keyPair');
    await ssh.connect({
      host: this.store.get('publicIp'),
      username: 'ec2-user',
      privateKey: keyPair.privateKey
    });
    return ssh;
  };

  buildCurlCommand = (data: any): string => {
    return `curl -s -o /dev/null -w "%{http_code}" --header "Content-Type: application/json" --header "Authorization: Bearer ${data.authToken}" --request ${data.method} ${data.data ? `--data '${JSON.stringify(data.data)}'` : ''} ${data.route}`;
  };
}
