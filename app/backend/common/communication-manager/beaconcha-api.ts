import Http from './http';
import config from '../config';
import Connection from '../store-manager/connection';

export default class BeaconchaApi extends Http {
  init = (network? : string) => {
    const networkFromStore = Connection.db().get('network');
    this.instance.defaults.baseURL = this.getBeaconChaByNetwork((network || networkFromStore));
  };
  getBeaconChaByNetwork = (network) => {
    switch (network) {
      case 'pyrmont':
        return config.env.PYRMONT_BEACONCHA_URL;
      case 'prater':
        return config.env.PRATER_BEACONCHA_URL;
      default:
        return config.env.BEACONCHA_URL;
    }
  };
}
