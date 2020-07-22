import Configstore from 'configstore';
import * as AWS from 'aws-sdk';
import { step } from '../decorators';

export default class AwsService {
  public ec2!: AWS.EC2;

  public readonly conf: Configstore;

  public readonly keyName: string = 'BLOX_INFRA_KEY_PAIR';
  public readonly securityGroupName: string = 'BLOX_INFRA_GROUP';
  public readonly defaultAwsOptions = {
    apiVersion: '2016-11-15',
    region: 'us-west-1',
  };

  constructor(storeName: string) {
    this.conf = new Configstore(storeName);

    if (!this.ec2 && this.conf.get('credentials')) {
      this.setAWSCredentials();
    }
  }

  @step({
    name: 'Set AWS Credentials',
    requiredConfig: ['credentials'],
  })
  async setAWSCredentials(): Promise<any> {
    this.ec2 = new AWS.EC2({
      ...this.defaultAwsOptions,
      credentials: this.conf.get('credentials'),
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
    requiredConfig: ['otp'],
  })
  async createEc2KeyPair() {
    if (this.conf.get('keyPair')) return;

    const {
      KeyPairId: pairId,
      KeyMaterial: privateKey,
    } = await this.ec2
      .createKeyPair({ KeyName: `${this.keyName}-${this.conf.get('otp')}` })
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
    requiredConfig: ['otp'],
  })
  async createSecurityGroup() {
    if (this.conf.get('securityGroupId')) return;

    const vpcList = await this.ec2.describeVpcs().promise();
    const vpc = vpcList?.Vpcs![0].VpcId;
    const securityData = await this.ec2
      .createSecurityGroup({
        Description: `${this.securityGroupName}-${this.conf.get('otp')}`,
        GroupName: `${this.securityGroupName}-${this.conf.get('otp')}`,
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
    requiredConfig: ['otp', 'securityGroupId', 'addressId'],
  })
  async createInstance() {
    if (this.conf.get('instanceId')) return;

    const data = await this.ec2
      .runInstances({
        ImageId: 'ami-0d3caf10672b8e870', // ubuntu 16.04LTS for us-west-1
        InstanceType: 't2.micro',
        SecurityGroupIds: [this.conf.get('securityGroupId')],
        KeyName: `${this.keyName}-${this.conf.get('otp')}`,
        MinCount: 1,
        MaxCount: 1,
      })
      .promise();
    const instanceId = data.Instances![0].InstanceId;
    await this.ec2
      .waitFor('instanceRunning', { InstanceIds: [instanceId] })
      .promise();
    this.conf.set('instanceId', instanceId);
    // await this.flow.delay(60000); // need to improve

    const tagsOptions: AWS.EC2.Types.CreateTagsRequest = {
      Resources: [instanceId],
      Tags: [{ Key: 'Name', Value: 'Blox-Infra-Server' }],
    };
    await this.ec2.createTags(tagsOptions).promise();
    await this.ec2
      .associateAddress({
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
  async uninstallItems() {
    await this.ec2.terminateInstances({ InstanceIds: [this.conf.get('instanceId')] }).promise();
    await this.ec2.waitFor('instanceTerminated', { InstanceIds: [this.conf.get('instanceId')] }).promise();
    await this.ec2.deleteSecurityGroup({ GroupId: this.conf.get('securityGroupId'), DryRun: false }).promise();
    await this.ec2.releaseAddress({ AllocationId: this.conf.get('addressId') }).promise();
    await this.ec2.deleteKeyPair({ KeyPairId: this.conf.get('keyPair').pairId }).promise();
  }

  @step({
    name: 'Truncate Old EC2 instance',
    requiredConfig: ['instanceId', 'addressId'],
  })
  async truncateServer() {
    // this.flow.validate('instanceId');
    // this.flow.validate('addressId');
    await this.ec2.terminateInstances({ InstanceIds: [this.conf.get('instanceId')] }).promise();
    await this.ec2.waitFor('instanceTerminated', { InstanceIds: [this.conf.get('instanceId')] }).promise();
    await this.ec2.releaseAddress({ AllocationId: this.conf.get('addressId') }).promise();
  }

  @step({
    name: 'Reboot instance',
    requiredConfig: ['instanceId'],
  })
  async rebootInstance() {
    // this.flow.validate('instanceId');
    await this.ec2.rebootInstances({ InstanceIds: [this.conf.get('instanceId')], DryRun: true }).promise();
  }
}
