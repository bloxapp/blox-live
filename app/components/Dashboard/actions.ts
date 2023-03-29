import * as actionTypes from './actionTypes';

export const setModalDisplay = (payload: Record<string, any>) => ({
  type: actionTypes.SET_MODAL_DISPLAY, payload
});

export const clearModalDisplayData = () => ({
  type: actionTypes.CLEAR_MODAL_DISPLAY_DATA,
});

export const setFeatures = (payload: Record<string, any>) => ({
  type: actionTypes.SET_FEATURES, payload
});
