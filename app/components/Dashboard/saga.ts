import { put } from 'redux-saga/effects';
import { setFeatures } from './actions';

export function* submitFeatures(features: Record<string, any>) {
  yield put(setFeatures({...features}));
}
