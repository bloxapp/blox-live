import net from 'net';
import ElectronStore from 'electron-store';
import * as AWS from 'aws-sdk';
import { step } from '../decorators';

export default class AwsService {
  public ec2!: AWS.EC2;

  public readonly conf: ElectronStore;

  public readonly keyName: string = 'BLOX_INFRA_KEY_PAIR';
  public readonly securityGroupName: string = 'BLOX_INFRA_GROUP';
  public readonly defaultAwsOptions = {
    apiVersion: '2016-11-15',
    region: 'us-west-1',
  };

  constructor(storeName: string) {
    this.conf = new ElectronStore({ name: storeName });

    if (!this.ec2 && this.conf.get('credentials')) {
      this.setAWSCredentials();
    }
  }

  @step({
    name: 'Set AWS Credentials',
    requiredConfig: ['credentials'],
  })
  async setAWSCredentials(): Promise<any> {
    const credentials : any = this.conf.get('credentials');
    this.ec2 = new AWS.EC2({
      ...this.defaultAwsOptions,
      credentials,
    });
  }

  @step({
    name: 'Check AWS keys permissions',
  })
  async validateAWSPermissions() {
    try {
      await this.ec2.describeInstances().promise();
      await this.ec2.describeAddresses().promise();
    } catch (error) {
      this.conf.delete('credentials');
      throw new Error(error.message);
    }
  }

  @step({
    name: 'Create EC2 Key Pair',
    requiredConfig: ['uuid'],
  })
  async createEc2KeyPair() {
    if (this.conf.get('keyPair')) return;

    const {
      KeyPairId: pairId,
      KeyMaterial: privateKey,
    } = await this.ec2
      .createKeyPair({ KeyName: `${this.keyName}-${this.conf.get('uuid')}` })
      .promise();
    this.conf.set('keyPair', { pairId, privateKey });
  }

  @step({
    name: 'Allocate Elastic IP',
  })
  async createElasticIp() {
    if (this.conf.get('addressId')) return;

    const {
      AllocationId: addressId,
      PublicIp: publicIp,
    } = await this.ec2.allocateAddress({ Domain: 'vpc' }).promise();
    this.conf.set('addressId', addressId);
    this.conf.set('publicIp', publicIp);
  }

  @step({
    name: 'Create Security Group',
    requiredConfig: ['uuid'],
  })
  async createSecurityGroup() {
    if (this.conf.get('securityGroupId')) return;

    const vpcList = await this.ec2.describeVpcs().promise();
    const vpc = vpcList?.Vpcs![0].VpcId;
    const securityData = await this.ec2
      .createSecurityGroup({
        Description: `${this.securityGroupName}-${this.conf.get('uuid')}`,
        GroupName: `${this.securityGroupName}-${this.conf.get('uuid')}`,
        VpcId: vpc,
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
            IpRanges: [{ CidrIp: '0.0.0.0/0' }],
          },
          {
            IpProtocol: 'tcp',
            FromPort: 22,
            ToPort: 22,
            IpRanges: [{ CidrIp: '0.0.0.0/0' }],
          },
        ],
      })
      .promise();
    this.conf.set('securityGroupId', securityGroupId);
  }

  @step({
    name: 'Setup VPC Linux Instance',
    requiredConfig: ['uuid', 'securityGroupId', 'addressId'],
  })
  async createInstance() {
    if (this.conf.get('instanceId')) return;

    const data = await this.ec2.runInstances({
      ImageId: 'ami-0d3caf10672b8e870', // ubuntu 16.04LTS for us-west-1
      InstanceType: 't2.micro',
      SecurityGroupIds: [this.conf.get('securityGroupId')],
      KeyName: `${this.keyName}-${this.conf.get('uuid')}`,
      MinCount: 1,
      MaxCount: 1,
    })
    .promise();
    const instanceId = data.Instances![0].InstanceId;
    await this.ec2
      .waitFor('instanceRunning', { InstanceIds: [instanceId] })
      .promise();
    this.conf.set('instanceId', instanceId);

    const tagsOptions: AWS.EC2.Types.CreateTagsRequest = {
      Resources: [instanceId],
      Tags: [{ Key: 'Name', Value: 'Blox-Infra-Server' }],
    };
    await this.ec2.createTags(tagsOptions).promise();
    await this.ec2.associateAddress({
      AllocationId: this.conf.get('addressId'),
      InstanceId: instanceId,
    })
    .promise();
    await new Promise((resolve) => setTimeout(resolve, 25000)); // hard delay for 25sec
  }

  @step({
    name: 'Delete all EC2 items',
    requiredConfig: ['instanceId', 'securityGroupId', 'addressId', 'keyPair'],
  })
  async uninstallItems(opts?: any) {
    const actions = {
      instance: async () => {
        await this.ec2.terminateInstances({ InstanceIds: [this.conf.get('instanceId')] }).promise()
      },
      securityGroup: async () => {
        await this.ec2.deleteSecurityGroup({ GroupId: this.conf.get('securityGroupId'), DryRun: false }).promise();
      },
      address: async () => {
        await this.ec2.releaseAddress({ AllocationId: this.conf.get('addressId') }).promise();
      },
      keyPair: async () => {
        await this.ec2.deleteKeyPair({ KeyPairId: this.conf.get('keyPair.pairId') }).promise();
      },
    };
    for (const actionName of Object.keys(actions)) {
      const pass = !Array.isArray(opts) || opts.includes(actionName);
      // eslint-disable-next-line no-await-in-loop
      pass && await actions[actionName]();
    }
  }

  @step({
    name: 'Truncate Old EC2 instance',
    requiredConfig: ['instanceId', 'addressId'],
  })
  async truncateServer() {
    await this.ec2.terminateInstances({ InstanceIds: [this.conf.get('instanceId')] }).promise();
    await this.ec2.waitFor('instanceTerminated', { InstanceIds: [this.conf.get('instanceId')] }).promise();
    await this.ec2.releaseAddress({ AllocationId: this.conf.get('addressId') }).promise();
  }

  @step({
    name: 'Reboot instance',
    requiredConfig: ['instanceId', 'publicIp'],
  })
  async rebootInstance({ notifier }) {
    await this.ec2.rebootInstances({ InstanceIds: [this.conf.get('instanceId')] }).promise();
    notifier.instance[notifier.func].bind(notifier.instance)({ step: { name: 'Server rebooting...', status: 'processing' } });
    await new Promise((resolve) => {
      const intervalId = setInterval(() => {
        const socket = new net.Socket();
        const onError = () => {
          console.log('waiting', this.conf.get('publicIp'));
          socket.destroy();
        };
        socket.setTimeout(1000);
        socket.once('error', onError);
        socket.once('timeout', onError);
        const ip : any = this.conf.get('publicIp');
        socket.connect(22, ip, () => {
          console.log('Server is online');
          notifier.instance[notifier.func].bind(notifier.instance)({ step: { name: 'Server is online', status: 'processing' } });
          socket.end();
          clearInterval(intervalId);
          resolve();
        });
      }, 5000);
    });
  }
}
