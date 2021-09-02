import analytics from '../analytics';
import ProcessClass from './process.class';
import AwsService from '../services/aws/aws.service';
import BaseStore from '../common/store-manager/base-store';
import Connection from '../common/store-manager/connection';
import WalletService from '../services/wallet/wallet.service';
import AccountService from '../services/account/account.service';
import KeyVaultService from '../services/key-vault/key-vault.service';

// TODO import from .env
const tempStorePrefix = 'tmp';
const mainStorePrefix = '';
export default class ReinstallProcess extends ProcessClass {
  private readonly awsServiceTmp: AwsService;
  private readonly accountServiceTmp: AccountService;
  private readonly awsService: AwsService;
  private readonly keyVaultServiceTmp: KeyVaultService;
  private readonly keyVaultService: KeyVaultService;
  private readonly walletServiceTmp: WalletService;
  public readonly actions: Array<any>;
  public readonly fallbackActions: Array<any>;

  constructor({ inputData = null }) {
    super('Reinstallation');
    const baseStore = new BaseStore();
    Connection.setup({
      currentUserId: baseStore.get('currentUserId'),
      tokenData: {
        authToken: baseStore.get('authToken'),
        refreshToken: baseStore.get('refreshToken'),
      },
      prefix: tempStorePrefix
    });
    Connection.cloneCryptoKey({
      fromPrefix: mainStorePrefix,
      toPrefix: tempStorePrefix
    });

    this.keyVaultServiceTmp = new KeyVaultService(tempStorePrefix);
    this.keyVaultService = new KeyVaultService();
    this.awsServiceTmp = new AwsService(tempStorePrefix);
    this.awsService = new AwsService();
    this.accountServiceTmp = new AccountService(tempStorePrefix);
    this.walletServiceTmp = new WalletService(tempStorePrefix);
    this.actions = [
      { instance: this.keyVaultService, method: 'importKeyVaultData' },
      {
        instance: Connection,
        method: 'clone',
        params: {
          fromPrefix: mainStorePrefix,
          toPrefix: tempStorePrefix,
          fields: ['uuid', 'securityGroupId', 'credentials', 'keyPair', 'slashingData', 'index', 'seed', 'port'],
          preClean: true, // clean toPrefix store before clone fields valie
          postClean: {
            prefix: mainStorePrefix,
            fields: ['slashingData', 'index']
          }
        }
      },
      { instance: this.awsServiceTmp, method: 'setAWSCredentials' },
      { instance: this.awsServiceTmp, method: 'createElasticIp' },
      { instance: this.awsServiceTmp, method: 'createSecurityGroup' },
      { instance: this.awsServiceTmp, method: 'createInstance' },
      { instance: this.keyVaultServiceTmp, method: 'configurateSshd' },
      { instance: this.keyVaultServiceTmp, method: 'installDockerScope' },
      { instance: this.keyVaultServiceTmp, method: 'runDockerContainer' },
      { instance: this.keyVaultServiceTmp, method: 'getKeyVaultRootToken' },
      { instance: this.keyVaultServiceTmp, method: 'getKeyVaultStatus' },
      { instance: this.accountServiceTmp, method: 'restoreAccounts', params: { inputData } },
      { instance: this.keyVaultServiceTmp, method: 'updateVaultMountsStorage' },
      { instance: this.walletServiceTmp, method: 'syncVaultWithBlox', params: { isNew: false, processName: 'reinstall', isSeedless: Array.isArray(inputData)} },
      { instance: this.awsServiceTmp, method: 'truncateOldKvResources' },
      { instance: this.awsServiceTmp, method: 'optimizeInstanceSecurity' },
      {
        instance: Connection,
        method: 'clone',
        params: {
          fromPrefix: tempStorePrefix,
          toPrefix: mainStorePrefix,
          fields: ['uuid', 'addressId', 'publicIp', 'instanceId', 'vaultRootToken', 'keyVaultVersion', 'keyVaultPluginVersion', 'securityGroupId', 'port'],
          postClean: {
            prefix: tempStorePrefix
          }
        }
      },
      {
        instance: Connection,
        method: 'remove',
        params: {
          prefix: tempStorePrefix
        }
      },
      {
        hook: async () => {
          await analytics.track('kv-updated');
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
              prefix: tempStorePrefix
            }
          },
          { instance: this.awsService, method: 'truncateOldKvResources' },
          { instance: this.awsService, method: 'optimizeInstanceSecurity' },
          {
            instance: Connection,
            method: 'remove',
            params: {
              prefix: tempStorePrefix
            }
          },
          {
            hook: async () => {
              await analytics.track('error-occurred', {
                reason: 'kv-update-failed'
              });
            }
          }
        ]
      }
    ];
  }
}
