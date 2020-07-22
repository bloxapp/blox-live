// eslint-disable-next-line import/no-cycle
import { Observer } from './observer.interface';

/**
 * The Subject interface declares a set of methods for managing subscribers.
 */
export interface Subject {
  // current action step
  state: number;

  // describe all steps inside subject
  actions: Array<any>;

  // Attach an observer to the subject.
  subscribe(observer: Observer): void;

  // Detach an observer from the subject.
  unsubscribe(observer: Observer): void;

  // Notify all observers about an event.
  notify(payload: any): void;
}
