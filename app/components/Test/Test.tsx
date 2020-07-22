import React from 'react';
import Configstore from 'configstore';
import InstallService from '../../backend/proccess-manager/install.service';
import { Observer } from '../../backend/proccess-manager/observer.interface';
import { Subject } from '../../backend/proccess-manager/subject.interface';

class Listener implements Observer {
  public update(subject: Subject, payload: any) {
    console.log(`${subject.state}/${subject.actions.length}`, payload.msg);
  }
}

const Test = () => {
  const storeName = 'blox';
  const conf = new Configstore(storeName);
  conf.set('otp', 'c559dcbc-f3ab-42b7-8478-d076e600d049');
  conf.set('credentials', {
    accessKeyId: 'test',
    secretAccessKey: 'test',
  });
  const installService = new InstallService(storeName);
  return (
    <div>
      <h1>CLI commands</h1>
      <button
        onClick={async () => {
          const listener = new Listener();
          installService.subscribe(listener);
          await installService.run();
          console.log('+ Congratulations. Installation is done!');
        }}
      >
        Install
      </button>
      <button onClick={() => console.log('test')}>Uninstall</button>
      <button onClick={() => console.log('test')}>Reinstall</button>
      <button onClick={() => console.log('test')}>Reboot</button>
    </div>
  );
};

export default Test;
