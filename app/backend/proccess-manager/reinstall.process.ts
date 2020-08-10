import ElectronStore from 'electron-store';
import ProcessClass from './process.class';
import ReinstallSubProcess from './reinstall-sub.process';
import UninstallProcess from './uninstall.process';
import { Observer } from './observer.interface';

export default class ReinstallProcess extends ProcessClass {
  private reinstallSubProcess: ReinstallSubProcess;
  private uninstallProcess: UninstallProcess;
  private tmpStoreName;
  private mainStoreName;

  constructor() {
    super();
    this.mainStoreName = this.storeName;
    this.tmpStoreName = `${this.storeName}-tmp`;
    this.reinstallSubProcess = new ReinstallSubProcess(this.tmpStoreName);
    this.uninstallProcess = new UninstallProcess(this.mainStoreName);
  }
  public async run(): Promise<void> {
    const confMain = new ElectronStore({ name: this.mainStoreName });

    this.setClientStorageParams(this.tmpStoreName, {
      uuid: confMain.get('uuid'),
      authToken: confMain.get('authToken'),
      credentials: confMain.get('credentials'),
      keyPair: confMain.get('keyPair'),
      securityGroupId: confMain.get('securityGroupId'),
      keyVaultStorage: confMain.get('keyVaultStorage'),
    });

    await this.reinstallSubProcess.run();
    await this.uninstallProcess.run();

    const confTmpStore = new ElectronStore({ name: this.tmpStoreName });
    console.log('confTmpStore====', confTmpStore);
    this.setClientStorageParams(this.mainStoreName, {
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
    const testmain = new ElectronStore({ name: this.mainStoreName });
    console.log('confTmpStore====', testmain);
    console.log('+ Congratulations. Reinstallation is done!');
  }

  public subscribe(observer: Observer): void {
    this.reinstallSubProcess.subscribe(observer);
    this.uninstallProcess.subscribe(observer);
  }

  private setClientStorageParams(storeName: string, params: any): void {
    const conf = new ElectronStore({ name: storeName });
    Object.keys(params).forEach((key) => {
      params[key] && conf.set(key, params[key]);
    });
  };

}
