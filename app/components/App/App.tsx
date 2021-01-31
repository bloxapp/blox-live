import React, {useState, useEffect} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import styled from 'styled-components';

import LoggedIn from '../LoggedIn';
import NotLoggedIn from '../NotLoggedIn';

import GlobalStyle from '../../common/styles/global-styles';
import {deepLink, initApp} from './service';

import {getIsLoggedIn, getIsLoading} from '../CallbackPage/selectors';
import * as loginActions from '../CallbackPage/actions';
import loginSaga from '../CallbackPage/saga';
import userSaga from '../User/saga';

import {Loader} from '../../common/components';
import {useInjectSaga} from '../../utils/injectSaga';

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

  const init = async () => {
    const baseStore: BaseStore = new BaseStore();
    if (!baseStore.get('appUuid')) {
      baseStore.set('appUuid', uuidv4());
    }
    const appUuid = baseStore.get('appUuid');

    // trigger analytics first event
    /* Identify users */
    analytics.identify(appUuid, {
      firstName: getOsVersion(),
      lastName: `v${version}`
    });

    /* Track events */
    analytics.track('appOpened', {
      label: appUuid,
    });

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
