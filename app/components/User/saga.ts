import { call, put, takeLatest } from 'redux-saga/effects';
import * as actionTypes from './actionTypes';
import * as actions from './actions';
import UsersService from 'backend/services/users/users.service';

const usersService = new UsersService();

function* startUpdatingUser(action) {
  const { payload } = action;
  try {
    yield call([usersService, 'update'], payload);
    yield put(actions.updateUserInfoSuccess());
  } catch (error) {
    yield error && put(actions.updateUserInfoFailure(error));
  }
}

export default function* passwordHandlerSaga() {
  yield takeLatest(actionTypes.UPDATE_USER, startUpdatingUser);
}
