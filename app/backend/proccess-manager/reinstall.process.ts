import ElectronStore from 'electron-store';
import ProcessClass from './process.class';
import ReinstallSubProcess from './reinstall-sub.process';
import UninstallProcess from './uninstall.process';

export default class ReinstallProcess extends ProcessClass {
  private reinstallSubProcess: ReinstallSubProcess;
  private uninstallProcess: UninstallProcess;
  public readonly actions: Array<any>;
  private tmpStoreName;

  constructor() {
    super();
    this.tmpStoreName = `${this.storeName}-tmp`;
    this.reinstallSubProcess = new ReinstallSubProcess(this.tmpStoreName);
    this.uninstallProcess = new UninstallProcess(this.storeName);
    const totalActions = this.reinstallSubProcess.actions.length + this.uninstallProcess.actions.length;
    this.actions = Array(totalActions).fill(1); // emulate total steps from 2 processes
    this.state = 0;
  }

  public async run(): Promise<void> {
    const confMain = new ElectronStore({ name: this.storeName });

    this.setClientStorageParams(this.tmpStoreName, {
      uuid: confMain.get('uuid'),
      authToken: confMain.get('authToken'),
      credentials: confMain.get('credentials'),
      keyPair: confMain.get('keyPair'),
      securityGroupId: confMain.get('securityGroupId'),
      keyVaultStorage: confMain.get('keyVaultStorage'),
    });

    const listener = {
      update: (_instance, payload) => {
        this.state += 1;
        // eslint-disable-next-line no-restricted-syntax
        for (const observer of this.observers) {
          observer.update(this, payload);
        }
      },
    };

    await this.reinstallSubProcess.run();
    await this.uninstallProcess.run();
    this.reinstallSubProcess.subscribe(listener);
    this.uninstallProcess.subscribe(listener);

    const confTmpStore = new ElectronStore({ name: this.tmpStoreName });
    console.log('confTmpStore====', confTmpStore);
    this.setClientStorageParams(this.storeName, {
      uuid: confTmpStore.get('uuid'),
      authToken: confTmpStore.get('authToken'),
      addressId: confTmpStore.get('addressId'),
      publicIp: confTmpStore.get('publicIp'),
      instanceId: confTmpStore.get('instanceId'),
      vaultRootToken: confTmpStore.get('vaultRootToken'),
      keyVaultVersion: confTmpStore.get('keyVaultVersion'),
      keyVaultStorage: confTmpStore.get('keyVaultStorage'),
    });
    confTmpStore.clear();
    // const testmain = new ElectronStore({ name: this.storeName });
    // console.log('confTmpStore====', testmain);
    // console.log('+ Congratulations. Reinstallation is done!');
  }

  private setClientStorageParams(storeName: string, params: any): void {
    const conf = new ElectronStore({ name: storeName });
    Object.keys(params).forEach((key) => {
      params[key] && conf.set(key, params[key]);
    });
  }
}
