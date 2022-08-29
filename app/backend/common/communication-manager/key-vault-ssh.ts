import NodeSSH from 'node-ssh';
import { Readable } from 'stream';
import { v4 as uuidv4 } from 'uuid';
import config from '~app/backend/common/config';
import { Log } from '~app/backend/common/logger/logger';
import Connection from '~app/backend/common/store-manager/connection';

const userName = 'ec2-user';

export default class KeyVaultSsh {
  private storePrefix: string;
  private logger: Log;
  private readonly sshClient: NodeSSH;

  constructor(prefix: string = '') {
    this.storePrefix = prefix;
    this.logger = new Log('key-vault-ssh');
    this.sshClient = new NodeSSH();
  }

  async getConnection(payload: any = {}): Promise<NodeSSH> {
    const { customPort } = payload;
    this.sshClient.dispose();
    const keyPair: any = Connection.db(this.storePrefix).get('keyPair');
    const port = customPort || Connection.db(this.storePrefix).get('port') || config.env.port;
    const params = {
      host: Connection.db(this.storePrefix).get('publicIp'),
      port,
      username: 'ec2-user',
      privateKey: keyPair.privateKey
    };

    try {
      await this.sshClient.connect(params);
    } catch (e) {
      this.logger.debug(e);
      await new Promise((resolve, reject) => {
        console.log('try connect thru ssh2');
        this.sshClient.connection.on('error', reject);
        this.sshClient.connection.on('ready', () => {
          console.log('Client :: ready');
          resolve(true);
        });
        this.sshClient.connection.connect(params);
      });
      if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
        console.debug('SSH:', this.sshClient, this.sshClient.isConnected());
      }
    }
    this.logger.trace('> publicIp', Connection.db(this.storePrefix).get('publicIp'));
    this.logger.trace('> port', port);
    return this.sshClient;
  }

  buildCurlCommand(data: any, returnBodyResponse?: boolean): string {
    // eslint-disable-next-line no-nested-ternary
    let body = '';
    if (data.dataAsFile) {
      body = `-d @${data.dataAsFile}`;
    } else if (data.data) {
      body = `--data '${JSON.stringify(data.data)}'`;
    }
    return `curl -s ${!returnBodyResponse ? '-o /dev/null -w "%{http_code}"' : ''} --header "Content-Type: application/json" --header "Authorization: Bearer ${data.authToken}" --request ${data.method} ${body} ${data.route} ${data.route.startsWith('https') ? '--insecure' : ''}`;
  }

  async dataToRemoteFile(data: any): Promise<string> {
    const readStream = Readable.from([JSON.stringify(data)]);
    const remoteFileName = `/home/${userName}/${uuidv4()}.data`;
    const ssh = await this.getConnection();
    await ssh.withSFTP(async (sftp) => {
      return new Promise((resolve, reject) => {
        const writeStream = sftp.createWriteStream(remoteFileName);
        writeStream.on('error', (err) => {
          reject(err);
        });
        writeStream.on('close', () => {
          resolve();
        });
        writeStream.on('end', () => {
            resolve();
        });
        readStream.pipe(writeStream);
      });
    });
    return remoteFileName;
  }
}
