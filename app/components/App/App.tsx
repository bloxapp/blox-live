import React, { useState, useEffect } from 'react';
import { notification } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { bindActionCreators } from 'redux';
import { Redirect, Route, Switch } from 'react-router-dom';
import { version } from '~app/package.json';
import Auth from '~app/components/Auth/Auth';
import analytics from '~app/backend/analytics';
import LoggedIn from '~app/components/LoggedIn';
import { Loader } from '~app/common/components';
import userSaga from '~app/components/User/saga';
import { getOsVersion } from '~app/utils/service';
import { useInjectSaga } from '~app/utils/injectSaga';
import NotLoggedIn from '~app/components/NotLoggedIn';
import useRouting from '~app/common/hooks/useRouting';
import { Log } from '~app/backend/common/logger/logger';
import NotFoundPage from '~app/components/NotFoundPage';
import { checkCompliance } from '~app/utils/compliance';
import GlobalStyle from '~app/common/styles/global-styles';
import Http from '~app/backend/common/communication-manager/http';
import { MODAL_TYPES } from '~app/components/Dashboard/constants';
import { ModalsManager } from '~app/components/Dashboard/components';
import BaseStore from '~app/backend/common/store-manager/base-store';
import * as actionsFromDashboard from '~app/components/Dashboard/actions';
import loginSaga from '~app/components/Login/components/CallbackPage/saga';
import { deepLink, initApp, cleanDeepLink } from '~app/components/App/service';
import * as loginActions from '~app/components/Login/components/CallbackPage/actions';
import { ContextMenu, SelectionContextMenu } from '~app/components/common/ContextMenu/ContextMenu';
import { getIsLoggedIn, getIsLoading } from '~app/components/Login/components/CallbackPage/selectors';

const loginKey = 'login';
const userKey = 'user';
const baseStore: BaseStore = new BaseStore();
const logger: Log = new Log('App');
const logoutNotification = {
  key: ''
};

type AppRouterProps = {
  isLoggedIn: boolean;
};

const AppRouter = ({ isLoggedIn }: AppRouterProps) => {
  const { ROUTES } = useRouting();

  return (
    <Switch>
      <Route exact path={ROUTES.ROOT} render={() => {
        const redirectUrl = isLoggedIn ? ROUTES.LOGGED_IN : ROUTES.LOGIN;
        if (isLoggedIn && logoutNotification.key) {
          notification.close(logoutNotification.key);
          logoutNotification.key = '';
        }
        return <Redirect to={redirectUrl} />;
      }} />
      <Route path={ROUTES.LOGGED_IN} component={LoggedIn} />
      <Route path={ROUTES.LOGIN} component={NotLoggedIn} />
      <Route path={ROUTES.NOT_FOUND} component={NotFoundPage} />
    </Switch>
  );
};

const AppWrapper = styled.div`
  margin: 0 auto;
  border-radius: 20px;
  height: 100%;
  overflow: hidden;
  overflow-y: scroll;
  ::-webkit-scrollbar {
    width: 0;  /* Remove scrollbar space */
    background: transparent;  /* Optional: just make scrollbar invisible */
  }

`;

const App = (props: AppProps) => {
  const [didInitApp, setAppInitialised] = useState(false);
  useInjectSaga({key: userKey, saga: userSaga, mode: ''});
  useInjectSaga({key: loginKey, saga: loginSaga, mode: ''});
  const { isLoggedIn, isLoading, actions, dashboardActions } = props;
  const { setModalDisplay, clearModalDisplayData } = dashboardActions;
  const { setSession, loginFailure } = actions;
  const [eventSessionData, setEventSessionData] = useState(null);

  const onLoginButtonClickedListener = () => {
    if (logoutNotification.key) {
      notification.close(logoutNotification.key);
      logoutNotification.key = '';
    }
  };

  const onLoginButtonClickedSubscribe = () => {
    Auth.events.removeListener(Auth.AUTH_EVENTS.LOGIN_BUTTON_CLICKED, onLoginButtonClickedListener);
    Auth.events.on(Auth.AUTH_EVENTS.LOGIN_BUTTON_CLICKED, onLoginButtonClickedListener);
  };

  const sessionExpiredListener = () => {
    actions.logout();
    if (!logoutNotification.key) {
      logoutNotification.key = 'logged-out';
      notification.error({
        message: 'You are logged out',
        description: 'Please login again',
        duration: 0,
        key: logoutNotification.key
      });
    }
  };

  const init = async () => {
    let firstTime = false;
    if (!baseStore.get('appUuid')) {
      firstTime = true;
      baseStore.set('appUuid', uuidv4());
    }
    const appUuid = baseStore.get('appUuid');

    // trigger analytics first event
    /* Identify users */
    await analytics.identify(appUuid, {
      os: getOsVersion(),
      appVersion: `v${version}`
    });

    /* Track events */
    await analytics.track('app-opened', {
      firstTime,
      appUuid
    });

    logger.info('app opened', {
      os: getOsVersion(),
      appVersion: `v${version}`
    });

    await setAppInitialised(true);
    await initApp();
  };

  const invalidTokenSubscribe = () => {
    Http.EventEmitter.removeAllListeners(Http.EVENTS.INVALID_TOKEN);
    Http.EventEmitter.once(Http.EVENTS.INVALID_TOKEN, sessionExpiredListener);
  };

  const accessTokenRefreshedSubscribe = () => {
    Http.EventEmitter.removeAllListeners(Http.EVENTS.NEW_ACCESS_TOKEN);
    Http.EventEmitter.on(Http.EVENTS.NEW_ACCESS_TOKEN, (obj) => { setEventSessionData(obj); });
  };

  const showComplianceDialog = () => {
    setModalDisplay({
      show: true,
      type: MODAL_TYPES.COMPLIANCE_MODAL,
      text: (
        <div>
          We are sorry, it seems that staking with Blox is restricted in your country. For additional information, feel free to reach us at
          &nbsp;
          <a href="mailto:contact@bloxstaking.com?subject=Blox is restricted in my country">contact@bloxstaking.com</a>.
        </div>
      ),
      confirmation: {
        title: 'Restricted Country',
        confirmButtonText: 'Close',
        onConfirmButtonClick: () => clearModalDisplayData(),
        onCancelButtonClick: false
      }
    });
  };

  const newAccessToken = async (obj) => {
    if ('token_id' in obj) {
      setSession(obj.token_id, obj.refresh_token);
      invalidTokenSubscribe();
      const restricted = await checkCompliance();
      if (restricted) {
        actions.logout();
        showComplianceDialog();
      }
    }
  };

  useEffect(() => {
    if (eventSessionData) {
      newAccessToken(eventSessionData);
    }
  }, [eventSessionData]);

  useEffect(() => {
    if (!didInitApp) {
      init();
    }
    deepLink(
      newAccessToken,
      loginFailure
    );
    onLoginButtonClickedSubscribe();
    accessTokenRefreshedSubscribe();
    invalidTokenSubscribe();

    return () => {
      cleanDeepLink();
      Http.EventEmitter.removeAllListeners(Http.EVENTS.INVALID_TOKEN);
    };
  }, [didInitApp, isLoggedIn, isLoading]);

  if (!didInitApp || isLoading) {
    return <Loader withHeader={false} />;
  }

  return (
    <AppWrapper>
      <AppRouter isLoggedIn={isLoggedIn} />
      <ModalsManager />
      <ContextMenu
        menu={(event, text) => {
          return <SelectionContextMenu event={event} text={text} />;
        }}
      />
      <GlobalStyle />
    </AppWrapper>
  );
};

type AppProps = {
  isLoggedIn: boolean;
  isLoading: boolean;
  actions: Record<string, any>;
  dashboardActions: Record<string, any>;
};

const mapStateToProps = (state: any) => ({
  isLoggedIn: getIsLoggedIn(state),
  isLoading: getIsLoading(state),
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(loginActions, dispatch),
  dashboardActions: bindActionCreators(actionsFromDashboard, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
