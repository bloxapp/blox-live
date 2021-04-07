import ElectronStore from 'electron-store';

// TODO import from .env
const baseStoreName = 'blox';

export default class BaseStore {
  public storage: ElectronStore;
  public baseStoreName: string;

  constructor() {
    this.baseStoreName = baseStoreName;
    this.storage = new ElectronStore({ name: baseStoreName });
  }

  set(key: string, value: any): void {
    if (!value) return;
    this.storage.set(key, value);
  }

  get(key: string): any {
    return this.storage.get(key);
  }

  delete(key: string): any {
    this.storage.delete(key);
  }

  clear(): void {
    this.storage.clear();
  }
}
