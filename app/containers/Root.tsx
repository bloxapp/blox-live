import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ConnectedRouter } from 'connected-react-router';
import { ThemeProvider } from 'styled-components';
import { hot } from 'react-hot-loader/root';
import { History } from 'history';
import App from '../components/App';
import Test from '../components/Test/Test';
import theme from '../theme';

type Props = {
  store: ReturnType<typeof configureStore>;
  history: History;
};

const Root = ({ store, history }: Props) => (
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <ThemeProvider theme={theme}>
        {process.env.BACKEND ? <Test /> : <App />}
      </ThemeProvider>
    </ConnectedRouter>
  </Provider>
);

export default hot(Root);
