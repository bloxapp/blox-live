import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { bindActionCreators } from 'redux';
import LoggedIn from '../LoggedIn';
import userSaga from '../User/saga';
import NotLoggedIn from '../NotLoggedIn';
import loginSaga from '../CallbackPage/saga';
import { deepLink, initApp } from './service';
import { Loader } from '../../common/components';
import { Log } from 'backend/common/logger/logger';
import { useInjectSaga } from '../../utils/injectSaga';
import * as loginActions from '../CallbackPage/actions';
import GlobalStyle from '../../common/styles/global-styles';
import { getIsLoggedIn, getIsLoading } from '../CallbackPage/selectors';

// analytics tools
import analytics from '../../backend/analytics';
import { getOsVersion } from 'utils/service';
import { version } from 'package.json';
import { v4 as uuidv4 } from 'uuid';
import BaseStore from '../../backend/common/store-manager/base-store';

const AppWrapper = styled.div`
  margin: 0 auto;
  height: 100%;
`;

const loginKey = 'login';
const userKey = 'user';

const App = (props: Props) => {
  const [didInitApp, setAppInitialised] = useState(false);
  useInjectSaga({key: userKey, saga: userSaga, mode: ''});
  useInjectSaga({key: loginKey, saga: loginSaga, mode: ''});
  const {isLoggedIn, isLoading, actions} = props;
  const {setSession, loginFailure} = actions;
  const logger = new Log();

  const init = async () => {
    const baseStore: BaseStore = new BaseStore();
    if (!baseStore.get('appUuid')) {
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
    await analytics.track('appOpened', {
      label: appUuid,
    });

    logger.debug('initialize app window');
    await setAppInitialised(true);
    await initApp();
  };

  useEffect(() => {
    if (!didInitApp) {
      init();
      deepLink((obj) => {
          if ('token_id' in obj) {
            setSession(obj.token_id);
          }
        },
        loginFailure);
    }
  }, [didInitApp, isLoggedIn, isLoading]);

  if (!didInitApp || isLoading) {
    return <Loader />;
  }

  return (
    <AppWrapper>
      {isLoggedIn ? <LoggedIn /> : <NotLoggedIn />}
      <GlobalStyle />
    </AppWrapper>
  );
};

type Props = {
  isLoggedIn: boolean;
  isLoading: boolean;
  isTokensExist: () => void;
  actions: Record<string, any>;
};

const mapStateToProps = (state: any) => ({
  isLoggedIn: getIsLoggedIn(state),
  isLoading: getIsLoading(state),
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(loginActions, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
