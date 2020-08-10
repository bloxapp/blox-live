import ElectronStore from 'electron-store';
import SeedService from '../key-vault/seed.service';
import ProcessClass from './process.class';

export default class RestoreProcess extends ProcessClass {
  public readonly seedService: SeedService;
  public readonly actions: Array<any>;

  constructor({ mnemonic }) {
    super();
    const storeName = 'blox';
    const conf = new ElectronStore({ name: storeName });
    if (conf.get('seed')) {
      throw new Error('Restore already completed');
    }
    conf.set('mnemonic', mnemonic);
    this.seedService = new SeedService(storeName);
    this.actions = [
      { instance: this.seedService, method: 'seedFromMnemonicGenerate' },
    ];
  }
}
