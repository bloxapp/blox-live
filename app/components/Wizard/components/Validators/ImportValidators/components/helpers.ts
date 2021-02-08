import config from '../../../../../../backend/common/config';
import Connection from '../../../../../../backend/common/store-manager/connection';

/**
 * Return network name for importing validators regarding default and config values
 */
export const getNetworkForImport = () => {
  let network = config.env.MAINNET_NETWORK;
  if (Connection.db().exists('feature:import:network')) {
    network = Connection.db().get('feature:import:network');
    console.log('Using "feature:import:network" value:', network);
  }
  return network;
};
