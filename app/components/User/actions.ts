import * as actionTypes from './actionTypes';

export const loadUserInfo = () => ({ type: actionTypes.LOAD_USER_INFO });

export const loadUserInfoSuccess = (info: Record<string, any>) => ({
  type: actionTypes.LOAD_USER_INFO_SUCCESS,
  payload: info
});

export const loadUserInfoFailure = (error: Record<string, any>) => ({
  type: actionTypes.LOAD_USER_INFO_FAILURE,
  payload: { ...error }
});

export const updateUserInfo = (info: Record<string, any>) => ({
  type: actionTypes.UPDATE_USER_INFO,
  payload: info,
});

export const updateUserInfoSuccess = () => ({
   type: actionTypes.UPDATE_USER_INFO_SUCCESS
});

export const updateUserInfoFailure = (error: Record<string, any>) => ({
  type: actionTypes.UPDATE_USER_INFO_FAILURE,
  payload: { ...error }
});

export const updateUserInfoInStore = (info: Record<string, any>) => ({
  type: actionTypes.UPDATE_USER_INFO_IN_STORE,
  payload: info
});
