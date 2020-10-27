import AwsService from '../services/aws/aws.service';
import KeyVaultService from '../services/key-vault/key-vault.service';
import ProcessClass from './process.class';
import WalletService from '../services/wallet/wallet.service';
import Store from '../common/store-manager/store';

// TODO import from .env
const tempStorePrefix = 'tmp';

export default class ReinstallProcess extends ProcessClass {
  private readonly awsService: AwsService;
  private readonly awsServiceOld: AwsService;
  private readonly keyVaultService: KeyVaultService;
  private readonly keyVaultServiceOld: KeyVaultService;
  private readonly walletService: WalletService;
  public readonly actions: Array<any>;

  constructor() {
    super();
    this.keyVaultService = new KeyVaultService(tempStorePrefix);
    this.keyVaultServiceOld = new KeyVaultService();
    this.awsService = new AwsService(tempStorePrefix);
    this.awsServiceOld = new AwsService();
    this.walletService = new WalletService(tempStorePrefix);
    const store: Store = Store.getStore();
    this.actions = [
      { instance: this.keyVaultServiceOld, method: 'importSlashingData' },
      { instance: store, method: 'prepareTmpStorageConfig' },
      { instance: this.awsService, method: 'setAWSCredentials' },
      { instance: this.awsService, method: 'createElasticIp' },
      { instance: this.awsService, method: 'createInstance' },
      { instance: this.keyVaultService, method: 'installDockerScope' },
      { instance: this.keyVaultService, method: 'runDockerContainer' },
      { instance: this.keyVaultService, method: 'getKeyVaultRootToken' },
      { instance: this.keyVaultService, method: 'updateVaultMountsStorage' },
      { instance: this.keyVaultService, method: 'exportSlashingData' },
      { instance: this.walletService, method: 'reSyncVaultWithBlox' },
      { instance: this.awsServiceOld, method: 'truncateServer' },
      { instance: store, method: 'saveTmpConfigIntoMain' },
      { instance: this.keyVaultServiceOld, method: 'getKeyVaultStatus' }
    ];
  }
}
