import { v4 as uuidv4 } from 'uuid';
import analytics from '../analytics';
import ProcessClass from './process.class';
import AwsService from '../services/aws/aws.service';
import UsersService from '../services/users/users.service';
import Connection from '../common/store-manager/connection';
import WalletService from '../services/wallet/wallet.service';
import KeyVaultService from '../services/key-vault/key-vault.service';

export default class InstallProcess extends ProcessClass {
  private readonly awsService: AwsService;
  private readonly keyVaultService: KeyVaultService;
  private readonly walletService: WalletService;
  private readonly userService: UsersService;
  public readonly actions: Array<any>;
  public readonly fallbackActions: Array<any>;
  public readonly maxRunBeforeFallback: number;

  constructor({ accessKeyId, secretAccessKey, isNew = true }) {
    super('Installation');
    this.userService = new UsersService();
    this.keyVaultService = new KeyVaultService();
    this.awsService = new AwsService();
    this.walletService = new WalletService();
    this.maxRunBeforeFallback = 2;

    const uuid = uuidv4();
    Connection.db().set('uuid', uuid);
    Connection.db().set('credentials', { accessKeyId, secretAccessKey });
    this.userService.update({ uuid });

    this.actions = [
      { instance: this.awsService, method: 'setAWSCredentials' },
      { instance: this.awsService, method: 'validateAWSPermissions' },
      { instance: this.awsService, method: 'createEc2KeyPair' },
      { instance: this.awsService, method: 'createElasticIp' },
      { instance: this.awsService, method: 'createSecurityGroup' },
      { instance: this.awsService, method: 'createInstance' },
      { instance: this.keyVaultService, method: 'configurateSshd' },
      { instance: this.keyVaultService, method: 'installDockerScope' },
      { instance: this.keyVaultService, method: 'runDockerContainer' },
      { instance: this.keyVaultService, method: 'getKeyVaultRootToken' },
      { instance: this.keyVaultService, method: 'getKeyVaultStatus' },
      { instance: this.walletService, method: 'syncVaultWithBlox', params: { isNew, processName: 'install' } },
      { instance: this.awsService, method: 'truncateOldKvResources' },
      { instance: this.awsService, method: 'optimizeInstanceSecurity' },
      {
        hook: async () => {
          await analytics.track('kv-install-completed');
        }
      }
  ];

    this.fallbackActions = [
      {
        postActions: true,
        actions: [
          { instance: this.awsService, method: 'setAWSCredentials' },
          {
            instance: Connection,
            method: 'clear',
            params: {
              prefix: ''
            }
          },
          { instance: this.awsService, method: 'truncateOldKvResources' },
          { instance: Connection, method: 'remove' },
          {
            hook: async () => {
              await analytics.track('error-occurred', {
                reason: 'kv-installation-failed'
              });
            }
          }
        ]
      }
    ];
  }
}
