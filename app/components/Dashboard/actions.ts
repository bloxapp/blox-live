import * as actionTypes from './actionTypes';

export const setModalDisplay = (payload: Record<string, any>) => ({
  type: actionTypes.SET_MODAL_DISPLAY, payload
});

export const clearModalDisplayData = () => ({
  type: actionTypes.CLEAR_MODAL_DISPLAY_DATA,
});

export const setTestNetHiddenFlag = (payload: Record<string, any>) => ({
  type: actionTypes.SET_TESTNET_FLAG, payload
});
