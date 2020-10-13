import { call, put, takeLatest } from 'redux-saga/effects';
import { notification } from 'antd';

import { LOAD_EVENT_LOGS } from './actionTypes';
import * as actions from './actions';
import { normalizedActiveValidators } from './service';
import OrganizationService from 'backend/services/organization/organization.service';

import { setModalDisplay } from '../Dashboard/actions';
import { MODAL_TYPES } from '../Dashboard/constants';

const organizationService = new OrganizationService();

export function* startLoadingEventLogs() {
  try {
    const response = yield call([organizationService, 'getEventLogs']);
    yield call(onLoadingEventLogsSuccess, response);
  } catch (error) {
    yield error && call(onLoadingEventLogsFailure, error);
  }
}

function* onLoadingEventLogsSuccess(response: Record<string, any>) {
  const activeValidators = normalizedActiveValidators(response);
  if (activeValidators.length > 0) {
    yield put(actions.showActiveValidatorsPopup(activeValidators));
    yield put(setModalDisplay({show: true, type: MODAL_TYPES.ACTIVE_VALIDATOR, text: ''}));
  }
  yield put(actions.loadEventLogsSuccess(response));
}

function* onLoadingEventLogsFailure(error: Record<string, any>) {
  notification.error({ message: 'Error', description: error.message });
  yield put(actions.loadEventLogsFailure(error.response.data));
}

export default function* organizationActions() {
  yield takeLatest(LOAD_EVENT_LOGS, startLoadingEventLogs);
}
