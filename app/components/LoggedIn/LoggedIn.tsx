import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import {
  Switch,
  Route,
  Redirect,
  withRouter,
  RouteComponentProps,
} from 'react-router-dom';

import { Loader } from '../../common/components';
import Settings from '../SettingsPage';
import NotFoundPage from '../NotFoundPage';
import Wizard from '../Wizard';
import EntryPage from '../EntryPage';

import { useInjectSaga } from '../../utils/injectSaga';

// wallet
import { loadWallet, setFinishedWizard } from '../Wizard/actions';
import {
  getWalletStatus,
  getIsLoading as getIsLoadingWallet,
  getWalletError,
  getWizardFinishedStatus,
} from '../Wizard/selectors';
import wizardSaga from '../Wizard/saga';

// accounts
import { loadAccounts } from '../Accounts/actions';
import {
  getAccounts,
  getAccountsLoadingStatus,
  getAccountsError,
} from '../Accounts/selectors';
import accountsSaga from '../Accounts/saga';

// websocket
import { connectToWebSockets } from '../WebSockets/actions';
import {
  getIsConnected,
  getIsLoading as getIsLoadingWebsocket,
  getError as getWebSocketError,
} from '../WebSockets/selectors';
import webSocketSaga from '../WebSockets/saga';

const wizardKey = 'wizard';
const accountsKey = 'accounts';
const websocketKey = 'websocket';

const LoggedIn = (props: Props) => {
  useInjectSaga({ key: wizardKey, saga: wizardSaga, mode: '' });
  useInjectSaga({ key: accountsKey, saga: accountsSaga, mode: '' });
  useInjectSaga({ key: websocketKey, saga: webSocketSaga, mode: '' });
  const [isFinishedLoadingAll, toggleLoadingAll] = useState(false);

  const {
    auth,
    isFinishedWizard,
    callSetFinishedWizard,
    walletStatus,
    isLoadingWallet,
    walletError,
    callLoadWallet,
    accounts,
    isLoadingAccounts,
    accountsError,
    callLoadAccounts,
    callConnectToWebSockets,
    isWebsocketLoading,
    websocket,
    webSocketError,
  } = props;

  useEffect(() => {
    // TODO: handle loggedIn from localStorage with socket
    const hasError = walletError || accountsError || webSocketError;
    const didntLoadWallet = !walletStatus && !isLoadingWallet && !walletError;
    const didntLoadAccounts = !accounts && !isLoadingAccounts && !accountsError;
    const didntLoadWebsocket =
      !websocket && !isWebsocketLoading && !webSocketError;

    if (hasError) {
      auth.logout();
    }

    if (didntLoadWallet) {
      callLoadWallet();
    }
    if (didntLoadAccounts && walletStatus) {
      callLoadAccounts();
    }
    if (didntLoadWebsocket && walletStatus) {
      callConnectToWebSockets();
    }

    if (walletStatus && accounts && websocket) {
      if (
        (walletStatus === 'active' || walletStatus === 'offline') &&
        accounts.length > 0
      ) {
        callSetFinishedWizard(true);
      }
      toggleLoadingAll(true);
    }
  }, [
    isLoadingWallet,
    isLoadingAccounts,
    isWebsocketLoading,
    isFinishedWizard,
  ]);

  if (!isFinishedLoadingAll) {
    return <Loader />;
  }

  return (
    <Switch>
      <Route
        exact
        path="/"
        render={(routeProps) =>
          isFinishedWizard ? <EntryPage {...routeProps} /> : <Wizard />
        }
      />
      <Route
        path="/settings/:path"
        render={(routeProps) => <Settings {...routeProps} withMenu />}
      />
      <Redirect from="/settings" to="/settings/general" />
      <Route path="" component={NotFoundPage} />
    </Switch>
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

  // websocket
  websocket: getIsConnected(state),
  isWebsocketLoading: getIsLoadingWebsocket(state),
  webSocketError: getWebSocketError(state),

  isFinishedWizard: getWizardFinishedStatus(state),
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  callLoadWallet: () => dispatch(loadWallet()),
  callLoadAccounts: () => dispatch(loadAccounts()),
  callConnectToWebSockets: () => dispatch(connectToWebSockets()),
  callSetFinishedWizard: (isFinished: boolean) =>
    dispatch(setFinishedWizard(isFinished)),
});

interface Props extends RouteComponentProps {
  auth: Record<string, any>;
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

  // websocket
  isWebsocketLoading: boolean;
  websocket: boolean;
  webSocketError: string;
  callConnectToWebSockets: () => void;
}

type State = Record<string, any>;

type Dispatch = (arg0: { type: string }) => any;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(LoggedIn));
