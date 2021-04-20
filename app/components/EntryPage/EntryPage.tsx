import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { bindActionCreators } from 'redux';
import {
  Switch, Route, Redirect
} from 'react-router-dom';
import { Loader } from '~app/common/components';
import Wizard from '~app/components/Wizard/Wizard';
import wizardSaga from '~app/components/Wizard/saga';
import useRouting from '~app/common/hooks/useRouting';
import { useInjectSaga } from '~app/utils/injectSaga';
import Header from '~app/components/common/Header/Header';
import Dashboard from '~app/components/Dashboard/Dashboard';
import { loadWallet } from '~app/components/Wizard/actions';
import { detectIfWalletNeedsUpdate } from '~app/utils/version';
import useAccounts from '~app/components/Accounts/useAccounts';
import useVersions from '~app/components/Versions/useVersions';
import walletSaga from '~app/components/KeyVaultManagement/saga';
import useEventLogs from '~app/components/EventLogs/useEventLogs';
import { MODAL_TYPES } from '~app/components/Dashboard/constants';
import * as wizardSelectors from '~app/components/Wizard/selectors';
import Connection from '~app/backend/common/store-manager/connection';
import Content from '~app/components/EntryPage/routes/wrappers/Content';
import * as actionsFromDashboard from '~app/components/Dashboard/actions';
import SettingsRoute from '~app/components/EntryPage/routes/SettingsRoute';
import * as keyvaultSelectors from '~app/components/KeyVaultManagement/selectors';
import { keyvaultLoadLatestVersion } from '~app/components/KeyVaultManagement/actions';

const DashboardWrapper = styled.div`
  width: 100%;
  min-height: 100%;
  padding-top: 70px;
  background-color: #f7fcff;
`;

const WizardWrapper = styled.div`
  width: 100%;
  min-height: 100%;
  background-color: #f7fcff;
  display: grid;
`;

const wizardKey = 'wizard';
const walletKey = 'keyvaultManagement';

const EntryPage = (props: Props) => {
  const {
    callLoadWallet, loadWalletLatestVersion, walletStatus, walletVersion,
    isLoadingWallet, walletError, keyvaultCurrentVersion, keyvaultPluginCurrentVersion,
    keyvaultLatestVersion, isLoadingKeyvault, keyvaultError,
    dashboardActions, isFinishedWizard, wizardWallet, isOpenedWizard
  } = props;

  const { setModalDisplay } = dashboardActions;

  useInjectSaga({key: wizardKey, saga: wizardSaga, mode: ''});
  useInjectSaga({key: walletKey, saga: walletSaga, mode: ''});

  const { accounts, isLoadingAccounts } = useAccounts();
  const { bloxLiveNeedsUpdate, isLoadingBloxLiveVersion } = useVersions();
  const { eventLogs, isLoadingEventLogs } = useEventLogs();
  const { ROUTES } = useRouting();

  useEffect(() => {
    const inForgotPasswordProcess = Connection.db().get('inForgotPasswordProcess');
    if (inForgotPasswordProcess) {
      setModalDisplay({ show: true, type: MODAL_TYPES.FORGOT_PASSWORD });
    }
  }, []);

  useEffect(() => {
    const didntLoadWallet = !walletStatus && !isLoadingWallet && !walletError;
    const didntLoadKeyvaultVersion = !keyvaultLatestVersion && !isLoadingKeyvault && !keyvaultError;

    if (didntLoadKeyvaultVersion) {
      loadWalletLatestVersion();
    }
    if (didntLoadWallet) {
      callLoadWallet();
    }
  }, [isLoadingWallet, keyvaultLatestVersion]);

  const walletNeedsUpdate = detectIfWalletNeedsUpdate(
    keyvaultLatestVersion,
    keyvaultCurrentVersion,
    keyvaultPluginCurrentVersion
  );

  console.warn({
    walletNeedsUpdate,
    keyvaultLatestVersion,
    keyvaultCurrentVersion,
    keyvaultPluginCurrentVersion
  });

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
      <Route
        exact
        path={ROUTES.LOGGED_IN}
        render={() => {
          if (showWizard) {
            return <Redirect to={ROUTES.WIZARD} />;
          }
          return <Redirect to={ROUTES.DASHBOARD} />;
        }}
      />
      <Route
        path={ROUTES.DASHBOARD}
        render={() => (
          <>
            <Header withMenu />
            <Content>
              <DashboardWrapper>
                <Dashboard {...otherProps} />
              </DashboardWrapper>
            </Content>
          </>
        )}
      />
      <Route
        path={ROUTES.WIZARD}
        render={() => (
          <WizardWrapper>
            <Wizard {...otherProps} />
          </WizardWrapper>
        )}
      />
      <Route
        path={ROUTES.SETTINGS}
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
  keyvaultPluginCurrentVersion: string;
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
  keyvaultPluginCurrentVersion: wizardSelectors.getWalletPluginVersion(state),
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
