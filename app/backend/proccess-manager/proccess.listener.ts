import { Subject } from '~app/backend/proccess-manager/subject.interface';
import { Observer } from '~app/backend/proccess-manager/observer.interface';

export default class ProcessListener implements Observer {
  private readonly logFunc: any;

  constructor(func: any) {
    this.logFunc = func;
  }

  public update(subject: Subject, payload: any) {
    let message = payload.step?.name;
    if (payload.state === 'fallback') {
      message = 'Process failed, Rolling back...';
    }
    this.logFunc(`${payload.step?.num}/${payload.step?.numOf} > ${message}`);
    console.log(`${payload.step?.num}/${payload.step?.numOf}`, payload);
  }
}
