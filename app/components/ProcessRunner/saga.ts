import { eventChannel, END } from 'redux-saga';
import { call, put, take, takeLatest, select } from 'redux-saga/effects';
import { PROCESS_SUBSCRIBE } from './actionTypes';
import * as actions from './actions';
import { processInstantiator, Listener } from './service';
import { getNetwork } from '../Wizard/selectors';
import { Log } from '../../backend/common/logger/logger';

function* startProcess(action) {
  const logger = new Log();
  const { payload } = action;
  const { name, credentials } = payload;
  const network = yield select(getNetwork);
  const process = processInstantiator(name, { credentials, network });
  const channel = yield call(createChannel, process);
  let isActive = false;
  let data;
  try {
    while (true) {
      const result = yield take(channel);
      const { payload: { isActive: isActiveFromStep, step, state, data: stepData, error }, subject } = result;
      if (isActiveFromStep) {
        isActive = isActiveFromStep;
      }
      if (stepData) {
        data = stepData;
      }
      // logger.info('result', result);
      step?.name && logger.info(`${step?.num}/${step?.numOf} - ${step?.name}`);
      let message = step?.name;
      let currentStep = 0;
      let overallSteps = 0;
      if (state === 'fallback') {
        message = 'Process failed, Rolling back...';
      } else {
        overallSteps = step?.numOf;
        currentStep = step?.num;
      }
      const observePayload = {
        overallSteps,
        currentStep,
        message,
        isActive: !error && isActive,
        data: !error && data
      };
      yield put(actions.processObserve(observePayload));
    }
  } catch (e) {
    yield put(actions.processFailure(e));
    channel.close();
  } finally {
    yield put(actions.processUnSubscribe());
    channel.close();
  }
}

function createChannel(process) {
  return eventChannel((emitter) => {
    const callback = (subject, payload) => {
      const { error, state } = payload;
      emitter({ subject, payload });
      if (state === 'completed') {
        process.unsubscribe(listener);
        if (error) {
          emitter(error);
        } else {
          emitter(END);
        }
      }
    };

    const listener = new Listener(callback);
    process.run();
    process.subscribe(listener);

    const unsubscribeTo = () => {
      process.unsubscribe(listener);
    };

    return unsubscribeTo;
  });
}

export default function* processRunnerSaga() {
  yield takeLatest(PROCESS_SUBSCRIBE, startProcess);
}
