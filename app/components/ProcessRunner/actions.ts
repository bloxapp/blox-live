import * as actionTypes from './actionTypes';

export const processSubscribe = (name: string, defaultMessage: string, credentials: Record<string, any>,
                                 network?: string, indexToRestore?: number) => ({
  type: actionTypes.PROCESS_SUBSCRIBE,
  payload: { name, defaultMessage, credentials, network, indexToRestore },
});

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
