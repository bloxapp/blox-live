import { Subject } from './subject.interface';
import { Observer } from './observer.interface';
import { Catch, catchDecoratorStore } from '../decorators';

export default class ProcessClass implements Subject {
  readonly actions: Array<any>;
  readonly fallbackActions: Array<any>;
  step: number;
  state: string;
  action: any;
  error: Error;
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
      return console.log('Subject: Observer has been attached already.');
      // return this.logger.debug('Subject: Observer has been attached already.');
    }
    console.log('Subject: Attached an observer.');
    // this.logger.debug('Subject: Attached an observer.');
    this.observers.push(observer);
  }

  unsubscribe(observer: any): void { // Observer
    const observerIndex = this.observers.indexOf(observer);
    if (observerIndex === -1) {
      return console.log('Subject: Nonexistent observer.');
      // return this.logger.debug('Subject: Nonexistent observer.');
    }

    this.observers.splice(observerIndex, 1);
    console.log('Subject: Detached an observer.');
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

  @Catch({
    displayMessage: 'Process failed'
  })
  async run(): Promise<void> {
    this.state = 'processing';
    try {
      // eslint-disable-next-line no-restricted-syntax
      for (const [index, action] of this.actions.entries()) {
        catchDecoratorStore.setHandler(error => this.errorHandler(error));
        this.action = action;
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
        // eslint-disable-next-line no-await-in-loop
        const result = await action.instance[action.method].bind(action.instance)(extra);
        const { name } = result.step;
        catchDecoratorStore.setHandler(null);
        if (this.error) {
          throw this.error;
        }
        delete result.step;
        this.notify({
          step: {
            name,
            num: this.step,
            numOf: this.actions.length
          },
          ...result
        });
      }
    } catch (e) {
      if (Array.isArray(this.fallbackActions)) {
        await this.fallBack();
      }
      this.notify({
        step: {
          error: this.error
        }
      });
    }
    this.state = 'completed';
  }

  async fallBack(): Promise<void> {
    this.state = 'fallback';
    console.log('-----FALL BACK ACTIONS-----');
    const fallBack4Method = this.fallbackActions.find(item => item.method === this.action.method);
    if (fallBack4Method) {
      console.log('==!==', fallBack4Method);
      // eslint-disable-next-line no-restricted-syntax
      for (const fallbackAction of fallBack4Method.actions) {
        // eslint-disable-next-line no-await-in-loop
        await fallbackAction.instance[fallbackAction.method].bind(fallbackAction.instance)({ ...fallbackAction.params });
      }
    }
    // finilize fallback thru post postActions params
    const postFallback = this.fallbackActions.find(item => item.postActions);
    if (postFallback) {
      console.log('==---==', postFallback);
      // eslint-disable-next-line no-restricted-syntax
      for (const fallbackAction of postFallback.actions) {
        console.log('===:::', fallbackAction.method);
        // eslint-disable-next-line no-await-in-loop
        const result = await fallbackAction.instance[fallbackAction.method].bind(fallbackAction.instance)({ ...fallbackAction.params });
        const { name } = result.step;
        delete result.step;
        this.notify({
          fallBackStep: {
            name,
            num: this.step,
            numOf: this.fallbackActions.length
          },
          ...result
        });
      }
    }
    this.state = 'completed';
    // this.error = null;
  }
}
