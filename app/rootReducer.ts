import { History } from 'history';
import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import user from '~app/components/User/reducer';
import wizard from '~app/components/Wizard/reducer';
import versions from '~app/components/Versions/reducer';
import accounts from '~app/components/Accounts/reducer';
import eventLogs from '~app/components/EventLogs/reducer';
import dashboard from '~app/components/Dashboard/reducer';
import migration from '~app/components/Migration/reducer';
import websocket from '~app/components/WebSockets/reducer';
import password from '~app/components/PasswordHandler/reducer';
import organization from '~app/components/Organization/reducer';
import processRunner from '~app/components/ProcessRunner/reducer';
import login from '~app/components/Login/components/CallbackPage/reducer';
import keyvaultManagement from '~app/components/KeyVaultManagement/reducer';

export default function createRootReducer(history: History) {
  return combineReducers({
    router: connectRouter(history),
    login,
    organization,
    wizard,
    dashboard,
    websocket,
    accounts,
    keyvaultManagement,
    processRunner,
    password,
    versions,
    eventLogs,
    user,
    migration
  });
}
