import Http from './http';
import config from '../config';
import Connection from '../store-manager/connection';

export default class BeaconchaApi extends Http {
  init = (network? : string) => {
    const networkFromStore = Connection.db().get('network');
    this.instance.defaults.baseURL = (network || networkFromStore) === 'pyrmont'
      ? config.env.PYRMONT_BEACONCHA_URL
      : config.env.BEACONCHA_URL;
  };
}
