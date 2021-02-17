import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Switch, Route } from 'react-router-dom';

import wizardSaga from '../Wizard/saga';
import RootRoute from './routes/RootRoute';
import { Loader } from 'common/components';
import { loadWallet } from '../Wizard/actions';
import SettingsRoute from './routes/SettingsRoute';
import walletSaga from '../KeyVaultManagement/saga';
import { MODAL_TYPES } from '../Dashboard/constants';
import * as wizardSelectors from '../Wizard/selectors';
import { useInjectSaga } from '../../utils/injectSaga';
import useAccounts from 'components/Accounts/useAccounts';
import useVersions from 'components/Versions/useVersions';
import useEventLogs from 'components/EventLogs/useEventLogs';
import * as actionsFromDashboard from '../Dashboard/actions';
import Connection from 'backend/common/store-manager/connection';
import * as keyvaultSelectors from '../KeyVaultManagement/selectors';
import useProcessRunner from 'components/ProcessRunner/useProcessRunner';
import { keyvaultLoadLatestVersion } from '../KeyVaultManagement/actions';

const wizardKey = 'wizard';
const walletKey = 'keyvaultManagement';

const EntryPage = (props: Props) => {
  const {
    callLoadWallet, loadWalletLatestVersion, walletStatus, walletVersion,
    isLoadingWallet, walletError, keyvaultCurrentVersion,
    keyvaultLatestVersion, isLoadingKeyvault, keyvaultError,
    dashboardActions, isFinishedWizard, wizardWallet, isOpenedWizard
  } = props;

  const { setModalDisplay } = dashboardActions;

  useInjectSaga({key: wizardKey, saga: wizardSaga, mode: ''});
  useInjectSaga({key: walletKey, saga: walletSaga, mode: ''});

  const { accounts, isLoadingAccounts } = useAccounts();
  const { bloxLiveNeedsUpdate, isLoadingBloxLiveVersion } = useVersions();
  const { eventLogs, isLoadingEventLogs } = useEventLogs();
  const { processData, error, clearProcessState } = useProcessRunner();

  useEffect(() => {
    const inForgotPasswordProcess = Connection.db().get('inForgotPasswordProcess');
    if (inForgotPasswordProcess) {
      setModalDisplay({ show: true, type: MODAL_TYPES.FORGOT_PASSWORD });
    }
  }, []);

  useEffect(() => {
    const didntLoadWallet = !walletStatus && !isLoadingWallet && !walletError;
    const didntLoadKeyvaultVersion = !keyvaultLatestVersion && !isLoadingKeyvault && !keyvaultError;

    if (processData || error) {
      clearProcessState();
    }
    if (didntLoadKeyvaultVersion) {
      loadWalletLatestVersion();
    }
    if (didntLoadWallet) {
      callLoadWallet();
    }
  }, [isLoadingWallet, keyvaultLatestVersion]);

  const walletNeedsUpdate = keyvaultCurrentVersion !== keyvaultLatestVersion;

  const otherProps = {
    walletNeedsUpdate,
    walletStatus,
    isLoadingWallet,
    accounts,
    isLoadingAccounts,
    eventLogs,
    isLoadingEventLogs,
    isLoadingBloxLiveVersion,
    bloxLiveNeedsUpdate,
    walletVersion: String(walletVersion).replace('v', '')
  };

  if (isLoadingWallet || isLoadingAccounts || !keyvaultLatestVersion || isLoadingEventLogs || isLoadingBloxLiveVersion) {
    return <Loader />;
  }

  // Regarding the flow - the user will always reach the Empty Dashboard
  // when they have a wallet but no validators
  const haveWallet = wizardWallet && wizardWallet.status !== 'notExist';
  const haveAccounts = Boolean(accounts?.length);
  const showDashboard = (!haveAccounts && haveWallet && !isOpenedWizard) || isFinishedWizard;
  const showWizard = !showDashboard;

  return (
    <Switch>
      <Route exact path="/"
        render={(renderProps) => (
          <RootRoute
            showDashboard={showDashboard}
            showWizard={showWizard}
            renderProps={{ ...renderProps, ...otherProps }}
          />
        )}
      />
      <Route path="/settings"
        render={(renderProps) => (
          <SettingsRoute
            renderProps={{ ...renderProps, ...otherProps }}
          />
        )}
      />
    </Switch>
  );
};

type Props = {
  walletStatus: string;
  walletVersion: string;
  isLoadingWallet: boolean;
  walletError: string;
  callLoadWallet: () => void;
  loadWalletLatestVersion: () => void;

  keyvaultCurrentVersion: string;
  keyvaultLatestVersion: string;
  isLoadingKeyvault: boolean;
  keyvaultError: string;

  bloxLiveNeedsUpdate: boolean;
  isLoadingBloxLiveVersion: boolean;

  dashboardActions: Record<string, any>;
  isFinishedWizard: boolean;
  isOpenedWizard: boolean;
  wizardWallet: any;
};

const mapStateToProps = (state: State) => ({
  walletStatus: wizardSelectors.getWalletStatus(state),
  walletVersion: wizardSelectors.getWalletVersion(state),
  isLoadingWallet: wizardSelectors.getIsLoading(state),
  walletError: wizardSelectors.getWalletError(state),

  keyvaultCurrentVersion: wizardSelectors.getWalletVersion(state),
  keyvaultLatestVersion: keyvaultSelectors.getLatestVersion(state),
  isLoadingKeyvault: keyvaultSelectors.getIsLoading(state),
  keyvaultError: keyvaultSelectors.getError(state),

  isFinishedWizard: wizardSelectors.getWizardFinishedStatus(state),
  isOpenedWizard: wizardSelectors.getWizardOpenedStatus(state),
  wizardWallet: wizardSelectors.getWallet(state),
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  callLoadWallet: () => dispatch(loadWallet()),
  loadWalletLatestVersion: () => dispatch(keyvaultLoadLatestVersion()),
  dashboardActions: bindActionCreators(actionsFromDashboard, dispatch),
});

type State = Record<string, any>;
type Dispatch = (arg0: { type: string }) => any;

export default connect(mapStateToProps, mapDispatchToProps)(EntryPage);
