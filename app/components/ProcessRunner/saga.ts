import { eventChannel, END } from 'redux-saga';
import { call, put, take, takeLatest, select } from 'redux-saga/effects';
import { PROCESS_SUBSCRIBE } from './actionTypes';
import * as actions from './actions';
import { processInstantiator, Listener } from './service';
import { getNetwork } from '../Wizard/selectors';

function* startProcess(action) {
  const { payload } = action;
  const { name, credentials } = payload;
  const network = yield select(getNetwork);
  const process = processInstantiator(name, { credentials, network });
  const channel = yield call(createChannel, process);
  try {
    while (true) {
      const result = yield take(channel);
      const { payload: { isActive, step, data }, subject } = result;
      console.log('result', result);
      console.log('state', subject.state);
      console.log(`${step.num}/${step.numOf} - ${step.name}`);
      console.log('isActive', isActive);
      let message = step.name;
      if (subject.state === 'fallback') {
        message = 'Process failed, Rolling back...';
      }
      let currentStep = 0;
      let overallSteps = 0;
      if (subject.state !== 'fallback') {
        overallSteps = step.numOf;
        currentStep = step.num;
      }
      const observePayload = {
        overallSteps,
        currentStep,
        message,
        isActive: !subject.error && isActive,
        data
      };
      console.log('====???? observePayload:', observePayload);
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
      const { state, error } = subject;
      if (state === 'completed') {
        if (error) {
          process.unsubscribe(listener);
          emitter(error);
        } else {
          process.unsubscribe(listener);
          emitter({ subject, payload });
          emitter(END);
        }
      } else {
        emitter({ subject, payload });
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
