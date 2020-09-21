import { PROCESSES } from './constants';
import InstallProcess from '../../backend/proccess-manager/install.process';
import RebootProcess from '../../backend/proccess-manager/reboot.process';
import ReinstallProcess from '../../backend/proccess-manager/reinstall.process';
import AccountCreateProcess from '../../backend/proccess-manager/account-create.process';

import { Observer } from '../../backend/proccess-manager/observer.interface';
import { Subject } from '../../backend/proccess-manager/subject.interface';

export const processInstantiator = (processName: string, payload: Record<string, any> | undefined) => {
  if (processName === PROCESSES.INSTALL && payload.credentials) {
    const { accessKeyId, secretAccessKey } = payload.credentials;
    return new InstallProcess({accessKeyId, secretAccessKey});
  }
  if (processName === PROCESSES.RESTART) {
    return new RebootProcess();
  }
  if (processName === PROCESSES.REINSTALL) {
    return new ReinstallProcess();
  }
  if (processName === PROCESSES.CREATE_ACCOUNT && payload.network) {
    return new AccountCreateProcess(payload.network);
  }
  return null;
};

export class Listener implements Observer {
  private logFunc: any;
  constructor(func: any) {
    this.logFunc = func;
  }
  public update(subject: Subject, payload: any) {
    this.logFunc(subject, payload);
  }
}
