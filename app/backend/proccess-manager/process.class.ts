import { Log } from '~app/backend/common/logger/logger';
import { Catch, catchDecoratorStore } from '~app/backend/decorators';
import BaseStore from '~app/backend/common/store-manager/base-store';
import { Subject } from '~app/backend/proccess-manager/subject.interface';
import { Observer } from '~app/backend/proccess-manager/observer.interface';

export default class ProcessClass implements Subject {
  readonly actions: Array<any>;
  readonly fallbackActions: Array<any>;
  readonly maxRunBeforeFallback: number = 0; // default
  readonly logger: Log;

  step: number;
  state: string;
  error: Error;
  action: any;
  processName: string;

  constructor(name = null) {
    this.logger = new Log('process');
    if (name) {
      this.processName = name;
    }
  }
  /**
   * @type {Observer[]} List of subscribers. In real life, the list of
   * subscribers can be stored more comprehensively (categorized by event
   * type, etc.).
   */
  observers: Observer[] = [];

  /**
   * The subscription management methods.
   */
  subscribe(observer: any): void { // Observer
    const isExist = this.observers.includes(observer);
    if (isExist) {
      return this.logger.debug('Subject: Observer has been attached already.');
      // return this.logger.debug('Subject: Observer has been attached already.');
    }
    this.logger.debug('Subject: Attached an observer.');
    // this.logger.debug('Subject: Attached an observer.');
    this.observers.push(observer);
  }

  unsubscribe(observer: any): void { // Observer
    const observerIndex = this.observers.indexOf(observer);
    if (observerIndex === -1) {
      return this.logger.debug('Subject: Nonexistent observer.');
      // return this.logger.debug('Subject: Nonexistent observer.');
    }

    this.observers.splice(observerIndex, 1);
    this.logger.debug('Subject: Detached an observer.');
    // this.logger.debug('Subject: Detached an observer.');
  }

  /**
   * Trigger an update in each subscriber.
   */
  notify(payload: any): void {
    // eslint-disable-next-line no-restricted-syntax
    for (const observer of this.observers) {
      observer.update(this, payload);
    }
  }

  private errorHandler = (payload: any) => {
    this.error = new Error(payload.displayMessage);
    return { error: payload.error };
  };

  private async processActions(actions) {
    this.processName && this.logger.info(`${this.processName} started`);
    this.error = null;
    // eslint-disable-next-line no-restricted-syntax
    for (const [index, action] of actions.entries()) {
      this.action = action;
      catchDecoratorStore.setHandler(error => this.errorHandler(error));
      this.step = index + 1;
      let extra = {
        notifier: {
          instance: this,
          func: 'notify'
        }
      };
      if (action.params) {
        extra = { ...extra, ...action.params };
      }
      if (action.hook) {
        // eslint-disable-next-line no-await-in-loop
        await action.hook(extra);
      } else {
        // eslint-disable-next-line no-await-in-loop
        const result = await action.instance[action.method].bind(action.instance)(extra);
        if (this.error) {
          this.logger.error(`${this.processName} failed`);
          this.logger.error(this.error.message, this.error);
          throw this.error;
        }
        const { name } = result.step;
        catchDecoratorStore.setHandler(null);
        delete result.step;
        this.notify({
          step: {
            name,
            num: this.step,
            numOf: actions.length
          },
          state: this.state,
          ...result
        });
      }
    }
    this.processName && this.logger.info(`${this.processName} done`);
  }

  @Catch({
    displayMessage: 'Process failed'
  })
  async run(): Promise<void> {
    const baseStore: BaseStore = new BaseStore();
    const proccessRun = baseStore.get('proccessRun') || 0;
    this.state = 'running';
    let error;
    try {
      await this.processActions(this.actions);
    } catch (e) {
      error = e;
      this.logger.error('-----MAIN PROCESS FAILED-----', error);
      baseStore.set('proccessRun', proccessRun + 1);
      const skipFallback = this.maxRunBeforeFallback && this.maxRunBeforeFallback > baseStore.get('proccessRun');
      this.logger.debug(`skipFallback: ${skipFallback}, maxRunBeforeFallback: ${this.maxRunBeforeFallback} run: ${baseStore.get('proccessRun')}`);
      if (!skipFallback) {
        baseStore.delete('proccessRun');
        await this.fallBack();
      }
    }
    this.notify({ state: 'completed', error });
  }

  async fallBack(): Promise<void> {
    if (!Array.isArray(this.fallbackActions)) return;
    this.state = 'fallback';
    this.logger.warn('-----FALLBACK RUN-----');
    try {
      const step = this.fallbackActions.find(item => item.method === this.action.method) || this.fallbackActions.find(item => item.postActions);
      if (!step?.actions) return;
      await this.processActions(step.actions);
    } catch (error) {
      this.logger.error('-----FALLBACK FAILED-----', error);
    }
  }
}
