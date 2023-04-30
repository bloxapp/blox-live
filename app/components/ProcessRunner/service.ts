import { PROCESSES } from '~app/components/ProcessRunner/constants';
import RebootProcess from '~app/backend/proccess-manager/reboot.process';
import { Subject } from '~app/backend/proccess-manager/subject.interface';
import UpgradeProcess from '~app/backend/proccess-manager/upgrade.process';
import InstallProcess from '~app/backend/proccess-manager/install.process';
import { Observer } from '~app/backend/proccess-manager/observer.interface';
import RecoveryProcess from '~app/backend/proccess-manager/recovery.process';
import ReinstallProcess from '~app/backend/proccess-manager/reinstall.process';
import AccountCreateProcess from '~app/backend/proccess-manager/account-create.process';
import SetWithdrawalAddressProcess from '~app/backend/proccess-manager/set-withdrawal-address.process';

export const processInstantiator = (processName: string, payload: Record<string, any> | undefined) => {
  if (processName === PROCESSES.INSTALL && payload.credentials) {
    const { accessKeyId, secretAccessKey } = payload.credentials;
    return new InstallProcess({accessKeyId, secretAccessKey});
  }
  if (processName === PROCESSES.RECOVERY && payload.credentials) {
    const {credentials, inputData, } = payload;
    const { accessKeyId, secretAccessKey} = credentials;
    return new RecoveryProcess({accessKeyId, secretAccessKey, isNew: false, inputData});
  }
  if (processName === PROCESSES.RESTART) {
    return new RebootProcess();
  }
  if (processName === PROCESSES.REINSTALL) {
    const { inputData, rewardAddressesData } = payload;
    return new ReinstallProcess({ inputData, rewardAddressesData });
  }
  if (processName === PROCESSES.UPGRADE) {
    return new UpgradeProcess();
  }
  if (processName === PROCESSES.CREATE_ACCOUNT && payload.network) {
    return new AccountCreateProcess(payload.network, payload.indexToRestore, payload.inputData, payload.deposited);
  }
  if (processName === PROCESSES.SET_WITHDRAWAL_ADDRESSES) {
    return new SetWithdrawalAddressProcess({ seed: payload.seed, accounts: payload.accounts });
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
