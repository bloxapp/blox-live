import config from '~app/backend/common/config';
import Connection from '~app/backend/common/store-manager/connection';

/**
 * Return network name for importing validators regarding default and config values
 */
export const getNetworkForImport = () => {
  let network = config.env.MAINNET_NETWORK;
  const importFeatureNetworkKey = config.FLAGS.FEATURES.IMPORT_NETWORK;
  if (Connection.db().exists(importFeatureNetworkKey)) {
    network = Connection.db().get(importFeatureNetworkKey);
    console.log(`Using "${importFeatureNetworkKey}" value:`, network);
  }
  return network;
};
