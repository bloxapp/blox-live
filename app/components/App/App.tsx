import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';

import LoggedIn from '../LoggedIn';
import NotLoggedIn from '../NotLoggedIn';

import Auth from '../Auth';
import GlobalStyle from '../../common/styles/global-styles';
import { initApp } from './service';

import { checkIfTokensExist } from '../CallbackPage/actions';
import { getIsLoggedIn, getIsLoading } from '../CallbackPage/selectors';
import saga from '../CallbackPage/saga';
import { Loader } from '../../common/components';
import { useInjectSaga } from '../../utils/injectSaga';

const AppWrapper = styled.div`
  margin: 0 auto;
  height: 100%;
`;

const key = 'login';
const auth = new Auth();

const App = (props: Props) => {
  const [didInitApp, setAppInitialised] = useState(false);
  useInjectSaga({ key, saga, mode: '' });
  const { isLoggedIn, isLoading, isTokensExist } = props;

  useEffect(() => {
    const init = async () => {
      if (!didInitApp) {
        await setAppInitialised(true);
        await isTokensExist();
        await initApp(isLoggedIn, auth);
      }
    };
    init();
  }, [didInitApp, isLoggedIn, isLoading]);

  if (!didInitApp || isLoading) {
    return <Loader />;
  }
  return (
    <AppWrapper>
      {isLoggedIn ? <LoggedIn auth={auth} /> : <NotLoggedIn />}
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

const mapDispatchToProps = (dispatch) => ({
  isTokensExist: () => dispatch(checkIfTokensExist()),
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
