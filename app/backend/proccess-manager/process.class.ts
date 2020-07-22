import { Subject } from './subject.interface';
import { Observer } from './observer.interface';

export default class ProcessClass implements Subject {
  public readonly actions: Array<any>;
  public state: number;
  /**
   * @type {Observer[]} List of subscribers. In real life, the list of
   * subscribers can be stored more comprehensively (categorized by event
   * type, etc.).
   */
  private observers: Observer[] = [];

  /**
   * The subscription management methods.
   */
  public subscribe(observer: Observer): void {
    const isExist = this.observers.includes(observer);
    if (isExist) {
      return console.log('Subject: Observer has been attached already.');
    }

    console.log('Subject: Attached an observer.');
    this.observers.push(observer);
  }

  public unsubscribe(observer: Observer): void {
    const observerIndex = this.observers.indexOf(observer);
    if (observerIndex === -1) {
      return console.log('Subject: Nonexistent observer.');
    }

    this.observers.splice(observerIndex, 1);
    console.log('Subject: Detached an observer.');
  }

  /**
   * Trigger an update in each subscriber.
   */
  public notify(payload: any): void {
    // eslint-disable-next-line no-restricted-syntax
    for (const observer of this.observers) {
      observer.update(this, payload);
    }
  }

  async run(): Promise<void> {
    // eslint-disable-next-line no-restricted-syntax
    for (const [index, action] of this.actions.entries()) {
      this.state = index + 1;
      // eslint-disable-next-line no-await-in-loop
      const result = await action.instance[action.method].bind(
        action.instance
      )();
      this.notify({ msg: result.step.name });
    }
  }
}
