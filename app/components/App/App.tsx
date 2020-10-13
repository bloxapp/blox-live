import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';

import LoggedIn from '../LoggedIn';
import NotLoggedIn from '../NotLoggedIn';

import GlobalStyle from '../../common/styles/global-styles';
import { initApp } from './service';

import { getIsLoggedIn, getIsLoading } from '../CallbackPage/selectors';
import loginSaga from '../CallbackPage/saga';
import userSaga from '../User/saga';

import { Loader } from '../../common/components';
import { useInjectSaga } from '../../utils/injectSaga';

const AppWrapper = styled.div`
  margin: 0 auto;
  height: 100%;
`;

const loginKey = 'login';
const userKey = 'user';

const App = (props: Props) => {
  const [didInitApp, setAppInitialised] = useState(false);
  useInjectSaga({ key: loginKey, saga: loginSaga, mode: '' });
  useInjectSaga({ key: userKey, saga: userSaga, mode: '' });
  const { isLoggedIn, isLoading } = props;

  const init = async () => {
    await setAppInitialised(true);
    await initApp();
  };

  useEffect(() => {
    if (!didInitApp) {
      init();
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
};

const mapStateToProps = (state: any) => ({
  isLoggedIn: getIsLoggedIn(state),
  isLoading: getIsLoading(state),
});

export default connect(mapStateToProps)(App);
