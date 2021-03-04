import NodeSSH from 'node-ssh';
import { Readable } from 'stream';
import { v4 as uuidv4 } from 'uuid';
import config from '../config';
import { Log } from '../logger/logger';
import Connection from '../store-manager/connection';

const userName = 'ec2-user';
let sshClient: NodeSSH;
export default class KeyVaultSsh {
  private storePrefix: string;
  private logger: Log;

  constructor(prefix: string = '') {
    this.storePrefix = prefix;
    this.logger = new Log('key-vault-ssh');
  }

  async getConnection(payload: any = {}): Promise<NodeSSH> {
    const { customPort, force } = payload;
    if (!sshClient) {
      sshClient = new NodeSSH();
    }
    if (force || !sshClient.isConnected()) {
      const keyPair: any = Connection.db(this.storePrefix).get('keyPair');
      const port = customPort || Connection.db(this.storePrefix).get('port') || config.env.port;
      const params = {
        host: Connection.db(this.storePrefix).get('publicIp'),
        port,
        username: 'ec2-user',
        privateKey: keyPair.privateKey
      };
      this.logger.debug('Try to ssh connect', params);
      try {
        await sshClient.connect(params);
      } catch (e) {
        this.logger.debug(e);
        const conn = sshClient.connection;
        await new Promise((resolve, reject) => {
          console.log('try connect thru ssh2');
          conn.on('error', reject);
          conn.on('ready', () => {
            console.log('Client :: ready');
            resolve(true);
          }).connect(params);
        });
      }
      this.logger.trace('> keyPair', keyPair);
      this.logger.trace('> publicIp', Connection.db(this.storePrefix).get('publicIp'));
      this.logger.trace('> port', port);
    }
    return sshClient;
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
