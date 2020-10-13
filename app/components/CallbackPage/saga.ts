import { call, put, takeLatest } from 'redux-saga/effects';
import { push } from 'connected-react-router';
import { notification } from 'antd';
import os from 'os';
import { version } from 'package.json';

import { LOGIN_INIT, LOGOUT } from './actionTypes';
import { setIdToken, loginSuccess, loginFailure } from './actions';
import Auth from '../Auth';
import { saveLastConnection } from 'common/service';
import { updateUserInfo } from 'components/User/actions';

const auth = new Auth();

function* onLoginSuccess(authResult) {
  const { idToken, idTokenPayload } = authResult;
  const userInfo = { os: `${os.type()} ${os.release()}`, appVersion: version };
  yield put(updateUserInfo(userInfo));
  yield put(setIdToken(idToken));
  yield put(loginSuccess(idTokenPayload));
  yield put(push('/'));
}

function* onLoginFailure(error: Record<string, any>) {
  yield put(loginFailure(error.message));
  if (error.message) {
    notification.error({ message: 'Error', description: error.message });
  }
  yield put(push('/login'));
}

export function* startLogin(action) {
  const { payload } = action;
  try {
    const authResult = yield call(auth.loginWithSocialApp, payload);
    yield call(onLoginSuccess, authResult);
  } catch (error) {
    yield error && call(onLoginFailure, error);
  }
}

export function* startLogOut() {
  yield saveLastConnection();
  yield call(auth.logout);
  yield put(push('/login'));
}

export default function* loginSaga() {
  yield takeLatest(LOGIN_INIT, startLogin);
  yield takeLatest(LOGOUT, startLogOut);
}
