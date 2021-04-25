import analytics from '../analytics';
import ProcessClass from './process.class';
import AwsService from '../services/aws/aws.service';
import WalletService from '../services/wallet/wallet.service';
import KeyVaultService from '../services/key-vault/key-vault.service';

export default class UpgradeProcess extends ProcessClass {
  private readonly awsService: AwsService;
  private readonly keyVaultService: KeyVaultService;
  private readonly walletService: WalletService;
  public readonly actions: Array<any>;

  constructor() {
    super('Upgrade');
    this.awsService = new AwsService();
    this.keyVaultService = new KeyVaultService();
    this.walletService = new WalletService();
    this.actions = [
      { instance: this.awsService, method: 'setAWSCredentials' },
      { instance: this.keyVaultService, method: 'upgradePlugin' },
      { instance: this.keyVaultService, method: 'getKeyVaultStatus' },
      { instance: this.awsService, method: 'updatePluginTag' },
      { instance: this.walletService, method: 'syncVaultWithBlox', params: { isNew: false, processName: 'upgrade' } },
      {
        hook: async () => {
          await analytics.track('kv-upgraded');
        }
      }
    ];
  }
}
