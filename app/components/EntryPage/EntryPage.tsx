import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { bindActionCreators } from 'redux';
import { Switch, Route } from 'react-router-dom';

import Wizard from '../Wizard';
import Dashboard from '../Dashboard';
import Header from '../common/Header';
import wizardSaga from '../Wizard/saga';
import { Loader } from 'common/components';
import SettingsPage from '../SettingsPage';
import { loadWallet } from '../Wizard/actions';
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

const DashboardWrapper = styled.div`
  width: 100%;
  min-height:100%;
  padding-top: 70px;
  background-color: #f7fcff;
`;

const WizardWrapper = styled.div`
  width: 100%;
  min-height:100%;
  background-color: #f7fcff;
`;

const Content = styled.div`
  width: 100%;
  min-height:100%;
  max-width: 1360px;
  margin: auto;
  display: flex;
`;

let initiallyShowDashboard = null;

const EntryPage = (props: Props) => {
  const {
    callLoadWallet, loadWalletLatestVersion, walletStatus,
    isLoadingWallet, walletErorr, keyvaultCurrentVersion,
    keyvaultLatestVersion, isLoadingKeyvault, keyvaultError,
    dashboardActions, isFinishedWizard, wizardWallet
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
    const didntLoadWallet = !walletStatus && !isLoadingWallet && !walletErorr;
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
    bloxLiveNeedsUpdate
  };

  if (isLoadingWallet || isLoadingAccounts || !keyvaultLatestVersion || isLoadingEventLogs || isLoadingBloxLiveVersion) {
    return <Loader />;
  }

  // Regarding the flow - the user will always reach the Empty Dashboard
  // when they have a wallet but no validators
  const haveWallet = wizardWallet && wizardWallet.status !== 'notExist';
  const haveAccounts = accounts && accounts.length;
  const shouldShowEmptyDashboard = !haveAccounts && haveWallet;

  if (initiallyShowDashboard === null) {
    // If dropped-off and this is first time dashboard is shown
    initiallyShowDashboard = shouldShowEmptyDashboard;
  } else if (initiallyShowDashboard) {
    // When first time after dropped-off dashboard is shown,
    // afterwards it will be always shown/hidden depending of isFinishedWizard value
    // Dirty but it works as expected
    initiallyShowDashboard = false;
  }

  const showDashboard = initiallyShowDashboard || isFinishedWizard;
  const showWizard = !showDashboard;

  return (
    <>
      <Header withMenu isDashboard={showDashboard} />
      <Content>
        <Switch>
          <Route exact path="/"
            render={(renderProps) => (
              <>
                {showDashboard && (
                  <DashboardWrapper>
                    <Dashboard {...renderProps} {...otherProps} />
                  </DashboardWrapper>
                )}
                {showWizard && (
                  <WizardWrapper>
                    <Wizard {...renderProps} {...otherProps} />
                  </WizardWrapper>
                )}
              </>
            )}
          />
          <Route path="/settings"
            render={(renderProps) => (<SettingsPage withMenu {...renderProps} {...otherProps} />)}
          />
        </Switch>
      </Content>
    </>
  );
};

type Props = {
  walletStatus: string;
  isLoadingWallet: boolean;
  walletErorr: string;
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
  wizardWallet: any;
};

const mapStateToProps = (state: State) => ({
  walletStatus: wizardSelectors.getWalletStatus(state),
  isLoadingWallet: wizardSelectors.getIsLoading(state),
  walletErorr: wizardSelectors.getWalletError(state),

  keyvaultCurrentVersion: wizardSelectors.getWalletVersion(state),
  keyvaultLatestVersion: keyvaultSelectors.getLatestVersion(state),
  isLoadingKeyvault: keyvaultSelectors.getIsLoading(state),
  keyvaultError: keyvaultSelectors.getError(state),

  isFinishedWizard: wizardSelectors.getWizardFinishedStatus(state),
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
