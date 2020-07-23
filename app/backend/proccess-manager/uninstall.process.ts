import AwsService from '../aws/aws.service';
import ProcessClass from './process.class';

export default class UninstallProcess extends ProcessClass {
  public readonly awsService: AwsService;
  public readonly actions: Array<any>;

  constructor(storeName: string) {
    super();
    this.awsService = new AwsService(storeName);
    this.actions = [{ instance: this.awsService, method: 'truncateServer' }];
  }
}
