import { all } from 'redux-saga/effects';

import login from './components/CallbackPage/saga';
import organization from './components/Organization/saga';
import wizard from './components/Wizard/saga';
import websocket from './components/WebSockets/saga';
import accounts from './components/Accounts/saga';
import keyvaultManagement from './components/KeyVaultManagement/saga';
import processRunner from './components/ProcessRunner/saga';
import versions from './components/Versions/saga';
import eventLogs from './components/EventLogs/saga';
import password from './components/PasswordHandler/saga';
import user from './components/User/saga';

export default function* rootSaga() { // TODO: check injectSaga instead
  yield all([
    login(),
    organization(),
    wizard(),
    websocket(),
    accounts(),
    keyvaultManagement(),
    processRunner(),
    versions(),
    eventLogs(),
    password(),
    user(),
  ]);
}
