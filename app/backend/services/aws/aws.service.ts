import net from 'net';
import Store from '../../common/store-manager/store';
import * as AWS from 'aws-sdk';
import { CatchClass, Step } from '../../decorators';

// TODO import from .env
const tempStorePrefix = 'tmp';

@CatchClass<AwsService>()
export default class AwsService {
  private ec2!: AWS.EC2;
  private readonly store: Store;
  private readonly keyName: string = 'BLOX_INFRA_KEY_PAIR';
  private readonly securityGroupName: string = 'BLOX_INFRA_GROUP';
  private readonly defaultAwsOptions = {
    apiVersion: '2016-11-15',
    region: 'us-west-1'
  };

  constructor(storePrefix: string = '') {
    this.store = Store.getStore(storePrefix);

    if (!this.ec2 && this.store.get('credentials')) {
      this.setAWSCredentials();
    }
  }

  @Step({
    name: 'Securely connecting to AWS...',
    requiredConfig: ['credentials']
  })
  async setAWSCredentials(): Promise<any> {
    const credentials: any = this.store.get('credentials');
    this.ec2 = new AWS.EC2({
      ...this.defaultAwsOptions,
      credentials
    });
  }

  @Step({
    name: 'Checking AWS keys permissions...'
  })
  async validateAWSPermissions() {
    try {
      await this.ec2.describeInstances().promise();
      await this.ec2.describeAddresses().promise();
    } catch (error) {
      this.store.delete('credentials');
      throw new Error(error.message);
    }
  }

  @Step({
    name: 'Creating secure EC2 key pair...',
    requiredConfig: ['uuid']
  })
  async createEc2KeyPair() {
    if (this.store.get('keyPair')) return;

    const {
      KeyPairId: pairId,
      KeyMaterial: privateKey
    } = await this.ec2
      .createKeyPair({ KeyName: `${this.keyName}-${this.store.get('uuid')}` })
      .promise();
    this.store.set('keyPair', { pairId, privateKey });
  }

  @Step({
    name: 'Enabling connection using Elastic IP...'
  })
  async createElasticIp() {
    if (this.store.get('addressId')) return;

    const {
      AllocationId: addressId,
      PublicIp: publicIp
    } = await this.ec2.allocateAddress({ Domain: 'vpc' }).promise();
    this.store.set('addressId', addressId);
    this.store.set('publicIp', publicIp);
  }

  @Step({
    name: 'Setting security group permissions...',
    requiredConfig: ['uuid']
  })
  async createSecurityGroup() {
    if (this.store.get('securityGroupId')) return;

    const vpcList = await this.ec2.describeVpcs().promise();
    const vpc = vpcList?.Vpcs![0].VpcId;
    const securityData = await this.ec2
      .createSecurityGroup({
        Description: `${this.securityGroupName}-${this.store.get('uuid')}`,
        GroupName: `${this.securityGroupName}-${this.store.get('uuid')}`,
        VpcId: vpc
      })
      .promise();
    const securityGroupId = securityData.GroupId;
    await this.ec2
      .authorizeSecurityGroupIngress({
        GroupId: securityGroupId,
        IpPermissions: [
          {
            IpProtocol: 'tcp',
            FromPort: 8200,
            ToPort: 8200,
            IpRanges: [{ CidrIp: '0.0.0.0/0' }]
          },
          {
            IpProtocol: 'tcp',
            FromPort: 22,
            ToPort: 22,
            IpRanges: [{ CidrIp: '0.0.0.0/0' }]
          }
        ]
      }).promise();
    this.store.set('securityGroupId', securityGroupId);
  }

  @Step({
    name: 'Establishing KeyVault server...',
    requiredConfig: ['uuid', 'securityGroupId', 'addressId']
  })
  async createInstance() {
    if (this.store.get('instanceId')) return;

    const data = await this.ec2.runInstances({
      ImageId: 'ami-0d3caf10672b8e870', // ubuntu 16.04LTS for us-west-1
      InstanceType: 't2.micro',
      SecurityGroupIds: [this.store.get('securityGroupId')],
      KeyName: `${this.keyName}-${this.store.get('uuid')}`,
      MinCount: 1,
      MaxCount: 1
    }).promise();
    const instanceId = data.Instances![0].InstanceId;
    await this.ec2
      .waitFor('instanceRunning', { InstanceIds: [instanceId] })
      .promise();
    this.store.set('instanceId', instanceId);

    const tagsOptions: AWS.EC2.Types.CreateTagsRequest = {
      Resources: [instanceId],
      Tags: [{ Key: 'Name', Value: 'Blox-Infra-Server' }]
    };
    await this.ec2.createTags(tagsOptions).promise();
    await this.ec2.associateAddress({
      AllocationId: this.store.get('addressId'),
      InstanceId: instanceId
    }).promise();
    await new Promise((resolve) => setTimeout(resolve, 25000)); // hard delay for 25sec
  }

  @Step({
    name: 'Delete all EC2 items',
    requiredConfig: ['instanceId', 'securityGroupId', 'addressId', 'keyPair']
  })
  async uninstallItems() {
    await this.ec2.terminateInstances({ InstanceIds: [this.store.get('instanceId')] }).promise();
    await this.ec2.waitFor('instanceTerminated', { InstanceIds: [this.store.get('instanceId')] }).promise();
    await this.ec2.releaseAddress({ AllocationId: this.store.get('addressId') }).promise();
    await this.ec2.deleteKeyPair({ KeyPairId: this.store.get('keyPair.pairId') }).promise();
    await this.ec2.deleteSecurityGroup({ GroupId: this.store.get('securityGroupId'), DryRun: false }).promise();
    this.store.clear();
    const storeTmp = Store.getStore(tempStorePrefix);
    storeTmp.clear();
  }

  @Step({
    name: 'Removing old EC2 instance...',
    requiredConfig: ['instanceId', 'addressId']
  })
  async truncateServer() {
    await this.ec2.terminateInstances({ InstanceIds: [this.store.get('instanceId')] }).promise();
    await this.ec2.waitFor('instanceTerminated', { InstanceIds: [this.store.get('instanceId')] }).promise();
    await this.ec2.releaseAddress({ AllocationId: this.store.get('addressId') }).promise();
  }

  @Step({
    name: 'Establishing connection to your server...',
    requiredConfig: ['instanceId', 'publicIp']
  })
  async rebootInstance() {
    await this.ec2.rebootInstances({ InstanceIds: [this.store.get('instanceId')] }).promise();
    await new Promise((resolve) => {
      let totalSeconds = 0;
      const DELAY = 5000; // 5 sec
      const intervalId = setInterval(() => {
        const socket = new net.Socket();
        const onError = () => {
          socket.destroy();
          console.log('waiting', this.store.get('publicIp'), totalSeconds);
          if (totalSeconds >= 80000) { // 80 sec
            console.log('Reached max timeout, exiting...', intervalId);
            clearInterval(intervalId);
            resolve();
            return;
          }
          totalSeconds += DELAY;
        };
        socket.setTimeout(1000);
        socket.once('error', onError);
        socket.once('timeout', onError);
        const ip: any = this.store.get('publicIp');
        socket.connect(22, ip, () => {
          console.log('Server is online');
          socket.destroy();
          clearInterval(intervalId);
          resolve();
        });
      }, DELAY);
    });
  }
}