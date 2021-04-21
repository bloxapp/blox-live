import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Switch,
  Route,
  withRouter,
  RouteComponentProps
} from 'react-router-dom';
import TestPage from '~app/components/Test';
import { Loader } from '~app/common/components';
import userSaga from '~app/components/User/saga';
import EntryPage from '~app/components/EntryPage';
import { onWindowClose } from '~app/common/service';
import wizardSaga from '~app/components/Wizard/saga';
import useRouting from '~app/common/hooks/useRouting';
import { useInjectSaga } from '~app/utils/injectSaga';
import { Log } from '~app/backend/common/logger/logger';
import accountsSaga from '~app/components/Accounts/saga';
import webSocketSaga from '~app/components/WebSockets/saga';
import { loadAccounts } from '~app/components/Accounts/actions';
import * as actionsFromUser from '~app/components/User/actions';
import * as userSelectors from '~app/components/User/selectors';
import Connection from '~app/backend/common/store-manager/connection';
import { allAccountsDeposited } from '~app/components/Accounts/service';
import { connectToWebSockets } from '~app/components/WebSockets/actions';
import { loadWallet, setFinishedWizard } from '~app/components/Wizard/actions';
import {
  isPrimaryDevice,
  inRecoveryProcess,
  inForgotPasswordProcess
} from '~app/components/LoggedIn/service';
import {
  getWalletStatus,
  getIsLoading as getIsLoadingWallet,
  getWalletError,
  getWizardFinishedStatus
} from '~app/components/Wizard/selectors';
import {
  getAccounts,
  getAccountsLoadingStatus,
  getAccountsError,
  getAddAnotherAccount
} from '~app/components/Accounts/selectors';
import {
  getIsConnected,
  getIsLoading as getIsLoadingWebsocket,
  getError as getWebSocketError
} from '~app/components/WebSockets/selectors';

const wizardKey = 'wizard';
const accountsKey = 'accounts';
const websocketKey = 'websocket';
const userKey = 'user';
const logger: Log = new Log('app/components/LoggedIn');

const LoggedIn = (props: Props) => {
  useInjectSaga({ key: wizardKey, saga: wizardSaga, mode: '' });
  useInjectSaga({ key: accountsKey, saga: accountsSaga, mode: '' });
  useInjectSaga({ key: websocketKey, saga: webSocketSaga, mode: '' });
  useInjectSaga({ key: userKey, saga: userSaga, mode: '' });

  const {
    isFinishedWizard, callSetFinishedWizard, walletStatus,
    isLoadingWallet, walletError, callLoadWallet,
    accounts, addAnotherAccount, isLoadingAccounts, accountsError,
    callLoadAccounts, callConnectToWebSockets, isWebsocketLoading,
    websocket, webSocketError, userInfo, userInfoError, isLoadingUserInfo, userActions
  } = props;
  const { loadUserInfo } = userActions;

  const [isFinishLoadingAll, toggleFinishLoadingAll] = useState(false);
  const { ROUTES } = useRouting();

  useEffect(() => {
    callLoadWallet();
    callLoadAccounts();
    loadUserInfo();
    callConnectToWebSockets();
  }, []);

  useEffect(() => {
    const allDataIsReady = !!walletStatus && !!accounts && !!websocket && !!userInfo;
    const noErrors = !walletError && !accountsError && !webSocketError && !userInfoError;
    const doneLoading = !isLoadingWallet && !isLoadingAccounts && !isWebsocketLoading && !isLoadingUserInfo;

    logger.debug('-------------------------');
    logger.debug('💈 Loading Wallet Status:', isLoadingWallet);
    logger.debug('💈 Loading Accounts Status:', isLoadingAccounts);
    logger.debug('💈 Loading Web Socket Status:', isWebsocketLoading);
    logger.debug('💈 Loading User Info Status:', isLoadingUserInfo);
    logger.debug('-------------------------');
    logger.debug('⭕ Loading Wallet Error:', walletError);
    logger.debug('⭕ Loading Accounts Error:', accountsError);
    logger.debug('⭕ Loading Web Socket Error:', webSocketError);
    logger.debug('⭕ Loading User Info Error:', userInfoError);
    logger.debug('-------------------------');
    logger.debug('✅ Loaded Wallet Status:', walletStatus);
    logger.debug('✅ Loaded Accounts:', accounts?.length);
    logger.debug('✅ Loaded Web Socket:', websocket);
    logger.debug('✅ Loaded User Info:', userInfo);

    if (allDataIsReady && noErrors && doneLoading) {
      const storedUuid = Connection.db().exists('uuid');
      const hasWallet = walletStatus === 'active' || walletStatus === 'offline';
      const shouldNavigateToDashboard = hasWallet && accounts.length > 0
        && allAccountsDeposited(accounts) && !addAnotherAccount;

      logger.debug('ℹ️️ Should Navigate to Dashboard: ', shouldNavigateToDashboard);

      logger.debug('ℹ️️ In Forgot Password Process: ', inForgotPasswordProcess());
      if (inForgotPasswordProcess()) {
        callSetFinishedWizard(true);
      }

      if ((!userInfo.uuid && storedUuid) || (isPrimaryDevice(userInfo.uuid) && !inRecoveryProcess())) {
        logger.debug('ℹ️️ Should Navigate to Wizard:', shouldNavigateToDashboard);
        shouldNavigateToDashboard && callSetFinishedWizard(true);
      }

      toggleFinishLoadingAll(true);
      onWindowClose();
    }
  }, [walletStatus, accounts, websocket, userInfo, isFinishedWizard]);

  if (!isFinishLoadingAll) {
    return <Loader />;
  }

  const RootPage = (rootPageProps: any) => {
    return <EntryPage {...rootPageProps} {...props} />;
  };

  return (
    <>
      <Switch>
        <Route exact path={ROUTES.TEST_PAGE} component={TestPage} />
        <Route path={ROUTES.LOGGED_IN} component={RootPage} />
      </Switch>
    </>
  );
};

const mapStateToProps = (state: State) => ({
  // wallet
  walletStatus: getWalletStatus(state),
  isLoadingWallet: getIsLoadingWallet(state),
  walletError: getWalletError(state),

  // accounts
  accounts: getAccounts(state),
  isLoadingAccounts: getAccountsLoadingStatus(state),
  accountsError: getAccountsError(state),
  addAnotherAccount: getAddAnotherAccount(state),

  // websocket
  websocket: getIsConnected(state),
  isWebsocketLoading: getIsLoadingWebsocket(state),
  webSocketError: getWebSocketError(state),

  // user
  userInfo: userSelectors.getInfo(state),
  isLoadingUserInfo: userSelectors.getLoadingStatus(state),
  userInfoError: userSelectors.getError(state),

  isFinishedWizard: getWizardFinishedStatus(state),
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  callLoadWallet: () => dispatch(loadWallet()),
  callLoadAccounts: () => dispatch(loadAccounts()),
  callConnectToWebSockets: () => dispatch(connectToWebSockets()),
  callSetFinishedWizard: (isFinished: boolean) => dispatch(setFinishedWizard(isFinished)),
  userActions: bindActionCreators(actionsFromUser, dispatch),
});

interface Props extends RouteComponentProps {
  isFinishedWizard: boolean;
  callSetFinishedWizard: (arg0: boolean) => void;

  // wallet
  walletStatus: string;
  isLoadingWallet: boolean;
  walletError: string;
  callLoadWallet: () => void;

  // accounts
  accounts: [];
  isLoadingAccounts: boolean;
  accountsError: string;
  callLoadAccounts: () => void;
  addAnotherAccount: boolean;

  // websocket
  isWebsocketLoading: boolean;
  websocket: boolean;
  webSocketError: string;
  callConnectToWebSockets: () => void;

  // user
  isLoadingUserInfo: boolean;
  userInfo: Record<string, any>;
  userInfoError: string;
  userActions: Record<string, any>;
}

type State = Record<string, any>;

type Dispatch = (arg0: { type: string }) => any;

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(LoggedIn));
