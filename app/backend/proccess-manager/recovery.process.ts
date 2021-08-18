import { v4 as uuidv4 } from 'uuid';
import analytics from '../analytics';
import ProcessClass from './process.class';
import AwsService from '../services/aws/aws.service';
import UsersService from '../services/users/users.service';
import Connection from '../common/store-manager/connection';
import WalletService from '../services/wallet/wallet.service';
import AccountService from '../services/account/account.service';
import KeyVaultService from '../services/key-vault/key-vault.service';

export default class RecoveryProcess extends ProcessClass {
  private readonly accountService: AccountService;
  private readonly awsService: AwsService;
  private readonly keyVaultService: KeyVaultService;
  private readonly walletService: WalletService;
  private readonly userService: UsersService;
  public readonly actions: Array<any>;
  public readonly fallbackActions: Array<any>;

  constructor({ accessKeyId, secretAccessKey, isNew = true, inputData = null }) {
    super('Recovery');
    this.accountService = new AccountService();
    this.awsService = new AwsService();
    this.keyVaultService = new KeyVaultService();
    this.userService = new UsersService();
    this.walletService = new WalletService();

    const uuid = uuidv4();
    const privateKeys = inputData?.privateKeys || null;

    Connection.db().set('uuid', uuid);
    Connection.db().set('credentials', { accessKeyId, secretAccessKey });
    this.userService.update({ uuid });

    this.actions = [
      { instance: this.accountService, method: 'recoverAccounts', params: { privateKeys }},
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
      { instance: this.keyVaultService, method: 'updateVaultMountsStorage' },
      { instance: this.walletService, method: 'syncVaultWithBlox', params: { isNew, processName: 'recovery', isSeedless: !!privateKeys } },
      { instance: this.awsService, method: 'truncateOldKvResources' },
      {
        hook: async () => {
          await analytics.track('recovery-completed');
        }
      }
    ];

    this.fallbackActions = [
      {
        postActions: true,
        actions: [
          { instance: this.awsService, method: 'setAWSCredentials' },
          { instance: this.awsService, method: 'truncateServer' },
          {
            instance: Connection,
            method: 'clear',
            params: {}
          },
          {
            instance: Connection,
            method: 'remove',
            params: {
              prefix: ''
            }
          },
          {
            hook: async () => {
              await analytics.track('error-occurred', {
                reason: 'recovery-failed'
              });
            }
          }
        ]
      }
    ];
  }
}
