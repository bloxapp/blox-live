import * as actionTypes from './actionTypes';

type Credentials = {
  accessKeyId: string;
  secretAccessKey: string;
};
export type ProcessParams = {
  credentials?: Credentials | null,
  network?: string,
  indexToRestore?: number
};

export const processSubscribe = (name: string, defaultMessage: string, params?: ProcessParams) => {
  return {
    type: actionTypes.PROCESS_SUBSCRIBE,
    payload: { name, defaultMessage, params: {...(params || {})}},
  };
};

export const processObserve = (payload: Record<string, any>) => ({
  type: actionTypes.PROCESS_OBSERVE,
  payload,
});

export const processUnSubscribe = () => ({
  type: actionTypes.PROCESS_UNSUBSCRIBE,
});

export const processFailure = (error: Record<string, any>) => ({
  type: actionTypes.PROCESS_FAILURE,
  payload: error,
});

export const processClearState = () => ({
  type: actionTypes.PROCESS_CLEAR_STATE,
});
