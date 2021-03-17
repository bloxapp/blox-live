import { useDispatch } from 'react-redux';
import wizardSaga from '~app/components/Wizard/saga';
import { useInjectSaga } from '~app/utils/injectSaga';
import accountSaga from '~app/components/Accounts/saga';
import { saveLastConnection } from '~app/common/service';
import versionsSaga from '~app/components/Versions/saga';
import eventLogsSaga from '~app/components/EventLogs/saga';
import { loadWallet } from '~app/components/Wizard/actions';
import { loadAccounts } from '~app/components/Accounts/actions';
import walletSaga from '~app/components/KeyVaultManagement/saga';
import { loadEventLogs } from '~app/components/EventLogs/actions';
import { loadBloxLiveVersion } from '~app/components/Versions/actions';
import { keyvaultLoadLatestVersion } from '~app/components/KeyVaultManagement/actions';

const useDashboardData = () => {
  useInjectSaga({key: 'wizard', saga: wizardSaga, mode: ''});
  useInjectSaga({key: 'accounts', saga: accountSaga, mode: ''});
  useInjectSaga({key: 'keyvaultManagement', saga: walletSaga, mode: ''});
  useInjectSaga({key: 'versions', saga: versionsSaga, mode: ''});
  useInjectSaga({key: 'eventLogs', saga: eventLogsSaga, mode: ''});

  const dispatch = useDispatch();

  const loadDashboardData = async (saveConnectionTime: boolean = false) => {
    saveConnectionTime && await saveLastConnection();
    await dispatch(loadWallet());
    await dispatch(loadAccounts());
    await dispatch(keyvaultLoadLatestVersion());
    await dispatch(loadBloxLiveVersion());
    await dispatch(loadEventLogs());
  };

  const loadDataAfterNewAccount = async () => {
    await dispatch(loadAccounts());
    await dispatch(loadEventLogs());
  };

  return { loadDashboardData, loadDataAfterNewAccount };
};

export default useDashboardData;
