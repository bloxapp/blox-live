import { useDispatch } from 'react-redux';
import config from '~app/backend/common/config';
import BaseStore from '~app/backend/common/store-manager/base-store';
import { setTestNetHiddenFlag as setTestNetHiddenFlagAction } from '~app/components/Dashboard/actions';

const useNetworkSwitcher = () => {
  const dispatch = useDispatch();
  const testNetConfigKey = config.FLAGS.DASHBOARD.TESTNET_HIDDEN;
  const baseStore = new BaseStore();

  const setTestNetHiddenFlag = (isHidden: boolean) => {
    dispatch(setTestNetHiddenFlagAction({ testNet: { isHidden }}));
    baseStore.set(testNetConfigKey, isHidden);
  };

  return { setTestNetHiddenFlag };
};

export default useNetworkSwitcher;
