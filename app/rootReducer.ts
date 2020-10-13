import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import { History } from 'history';

import globalReducer from './components/App/reducer';
import login from './components/CallbackPage/reducer';
import organization from './components/Organization/reducer';
import wizard from './components/Wizard/reducer';
import dashboard from './components/Dashboard/reducer';
import websocket from './components/WebSockets/reducer';
import accounts from './components/Accounts/reducer';
import keyvaultManagement from './components/KeyVaultManagement/reducer';
import processRunner from './components/ProcessRunner/reducer';
import versions from './components/Versions/reducer';
import eventLogs from './components/EventLogs/reducer';
import user from './components/User/reducer';

export default function createRootReducer(history: History) {
  return combineReducers({
    router: connectRouter(history),
    global: globalReducer,
    login,
    organization,
    wizard,
    dashboard,
    websocket,
    accounts,
    keyvaultManagement,
    processRunner,
    versions,
    eventLogs,
    user,
  });
}
