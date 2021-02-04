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

import { Log } from 'backend/common/logger/logger';

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
