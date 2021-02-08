import { call, put, takeLatest } from 'redux-saga/effects';
import * as actions from './actions';
import * as actionTypes from './actionTypes';
import Connection from 'backend/common/store-manager/connection';

import { notification } from 'antd';

function* savePassword(action) {
  const { payload } = action;
  try {
    yield call([Connection.db(), 'setCryptoKey'], payload);
    yield put(actions.savePasswordSuccess());
  }
  catch (error) {
    yield put(actions.savePasswordFailure(error.message));
    notification.error({ message: 'Error', description: error.message });
  }
}

function* replacePassword(action) {
  const { payload } = action;
  try {
    yield call([Connection.db(), 'setNewPassword'], payload);
    yield put(actions.savePasswordSuccess());
  }
  catch (error) {
    yield put(actions.savePasswordFailure(error.message));
    notification.error({ message: 'Error', description: error.message });
  }
}

function* validatePassword(action) {
  const { payload } = action;
  const isValid = yield call([Connection.db(), 'isCryptoKeyValid'], payload);
  if (isValid) {
    yield call([Connection.db(), 'setCryptoKey'], payload);
  }
  yield put(actions.setPasswordValidation(isValid));
}

export default function* passwordHandlerSaga() {
  yield takeLatest(actionTypes.SAVE_PASSWORD, savePassword);
  yield takeLatest(actionTypes.REPLACE_PASSWORD, replacePassword);
  yield takeLatest(actionTypes.CHECK_PASSWORD_VALIDATION, validatePassword);
}
