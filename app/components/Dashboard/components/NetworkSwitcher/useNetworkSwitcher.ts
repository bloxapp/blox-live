import { useDispatch } from 'react-redux';
import config from '~app/backend/common/config';
import { setFeatures } from '~app/components/Dashboard/actions';
import { prepareAccounts } from '~app/components/Accounts/actions';
import Connection from '~app/backend/common/store-manager/connection';

const useNetworkSwitcher = () => {
  const dispatch = useDispatch();
  const testNetConfigKey = config.FLAGS.DASHBOARD.TESTNET_SHOW;

  const setTestNetShowFlag = (show: boolean) => {
    dispatch(setFeatures({ isTestNetShow: show }));
    dispatch(prepareAccounts());
    Connection.db().set(testNetConfigKey, show);
    Connection.db().set('network', show ? 'prater' : 'mainnet');
  };

  return { setTestNetShowFlag };
};

export default useNetworkSwitcher;
