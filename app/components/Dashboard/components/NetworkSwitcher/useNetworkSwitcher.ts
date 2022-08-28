import { useDispatch } from 'react-redux';
import config from '~app/backend/common/config';
import Connection from '~app/backend/common/store-manager/connection';
import { setTestNetShowFlag as setTestNetShowFlagAction } from '~app/components/Dashboard/actions';

const useNetworkSwitcher = () => {
  const dispatch = useDispatch();
  const testNetConfigKey = config.FLAGS.DASHBOARD.TESTNET_SHOW;

  const setTestNetShowFlag = (show: boolean) => {
    dispatch(setTestNetShowFlagAction({ testNet: { show }}));
    Connection.db().set(testNetConfigKey, show);
    Connection.db().set('network', show ? 'prater' : 'mainnet');
  };

  return { setTestNetShowFlag };
};

export default useNetworkSwitcher;
