import Connection from '../store-manager/connection';
import NodeSSH from 'node-ssh';
import { Readable } from 'stream';
import { v4 as uuidv4 } from 'uuid';
import config from '../config';

const userName = 'ec2-user';

export default class KeyVaultSsh {
  private storePrefix: string;

  constructor(prefix: string = '') {
    this.storePrefix = prefix;
  }

  async getConnection(): Promise<NodeSSH> {
    const ssh = new NodeSSH();
    const keyPair: any = Connection.db(this.storePrefix).get('keyPair');
    console.log('keyPair=', keyPair)
    await ssh.connect({
      host: Connection.db(this.storePrefix).get('publicIp'),
      port: config.env.port,
      username: 'ec2-user',
      privateKey: keyPair.privateKey
    });
    return ssh;
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
    console.log(remoteFileName, data);
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
