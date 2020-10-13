import * as actionTypes from './actionTypes';

export const updateUserInfo = (info: Record<string, any>) => ({
  type: actionTypes.UPDATE_USER,
  payload: info,
});

export const updateUserInfoSuccess = () => ({
   type: actionTypes.UPDATE_USER_SUCCESS
});

export const updateUserInfoFailure = (error: Record<string, any>) => ({
  type: actionTypes.UPDATE_USER_FAILURE,
  payload: { ...error }
});
