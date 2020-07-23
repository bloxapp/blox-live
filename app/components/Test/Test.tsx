import React from 'react';
import Configstore from 'configstore';
import InstallProcess from '../../backend/proccess-manager/install.process';
import ReinstallProcess from '../../backend/proccess-manager/reinstall.process';
import UninstallProcess from '../../backend/proccess-manager/uninstall.process';
import AccountRemoveProcess from '../../backend/proccess-manager/account-remove.process';
import { Observer } from '../../backend/proccess-manager/observer.interface';
import { Subject } from '../../backend/proccess-manager/subject.interface';

class Listener implements Observer {
  public update(subject: Subject, payload: any) {
    console.log(`${subject.state}/${subject.actions.length}`, payload.msg);
  }
}

const setClientStorageParams = (storeName: string, params: any) => {
  const conf = new Configstore(storeName);
  Object.keys(params).forEach((key) => {
    conf.set(key, params[key]);
  });
};

const Test = () => {
  return (
    <div>
      <h1>CLI commands</h1>
      <button
        onClick={async () => {
          const storeName = 'blox';
          const conf = new Configstore(storeName);
          conf.set('otp', 'c559dcbc-f3ab-42b7-8478-d076e600d049');
          conf.set('credentials', {
            accessKeyId: 'test',
            secretAccessKey: 'test',
          });
          const installProcess = new InstallProcess(storeName);
          const listener = new Listener();
          installProcess.subscribe(listener);
          await installProcess.run();
          console.log('+ Congratulations. Installation is done!');
        }}
      >
        Install
      </button>
      <button
        onClick={async () => {
          const mainStoreName = `blox`;
          const tmpStoreName = `blox-tmp`;
          const confMain = new Configstore(mainStoreName);

          setClientStorageParams(tmpStoreName, {
            credentials: confMain.get('credentials'),
            otp: confMain.get('otp'),
            keyPair: confMain.get('keyPair'),
            securityGroupId: confMain.get('securityGroupId'),
          });

          const listener = new Listener();
          const reinstallProcess = new ReinstallProcess(tmpStoreName);
          reinstallProcess.subscribe(listener);
          await reinstallProcess.run();

          const confTmpStore = new Configstore(tmpStoreName);
          setClientStorageParams(confMain, {
            addressId: confTmpStore.get('addressId'),
            publicIp: confTmpStore.get('publicIp'),
            instanceId: confTmpStore.get('instanceId'),
            vaultRootToken: confTmpStore.get('vaultRootToken'),
            keyVaultVersion: confTmpStore.get('keyVaultVersion'),
          });
          confTmpStore.clear();

          console.log('+ Congratulations. Reinstallation is done!');
        }}
      >
        Reinstall
      </button>
      <button
        onClick={async () => {
          const storeName = 'blox';
          const uninstallProcess = new UninstallProcess(storeName);
          const accountRemoveProcess = new AccountRemoveProcess(storeName);
          const listener = new Listener();
          uninstallProcess.subscribe(listener);
          accountRemoveProcess.subscribe(listener);
          await uninstallProcess.run();
          await accountRemoveProcess.run();
          console.log('+ Uninstallation is done!');
        }}
      >
        Uninstall
      </button>
      <button onClick={() => console.log('test')}>Reboot</button>
    </div>
  );
};

export default Test;
