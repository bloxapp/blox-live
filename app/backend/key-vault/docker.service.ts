import ServerService from './server.service';
import { step } from '../decorators';

export default class DockerService {
  public readonly serverService: ServerService;

  constructor(storeName: string) {
    this.serverService = new ServerService(storeName);
  }

  @step({
    name: 'Install docker on a server',
  })
  async installDockerScope(): Promise<void> {
    const ssh = await this.serverService.getConnection();
    const { stdout } = await ssh.execCommand('docker -v', {});
    const installedAlready = stdout.includes('version');
    if (installedAlready) return;

    await ssh.execCommand('sudo yum update -y', {});
    await ssh.execCommand('sudo yum install docker -y', {});
    await ssh.execCommand('sudo service docker start', {});
    await ssh.execCommand('sudo usermod -a -G docker ec2-user', {});
    await ssh.execCommand(
      'sudo curl -L "https://github.com/docker/compose/releases/download/1.26.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose && sudo chmod +x /usr/local/bin/docker-compose',
      {},
    );
  }
}
