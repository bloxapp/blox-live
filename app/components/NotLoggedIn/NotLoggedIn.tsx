import React from 'react';
import { Switch, Route, withRouter, useRouteMatch } from 'react-router-dom';

import Login from '../Login';
import CallbackPage from '../CallbackPage';

const NotLoggedIn = () => {
  const { path } = useRouteMatch();
  return (
    <Switch>
      <Route exact path={`${path}`} component={Login} />
      <Route path={`${path}/callback`} component={CallbackPage} />
    </Switch>
  );
};

export default withRouter(NotLoggedIn);
