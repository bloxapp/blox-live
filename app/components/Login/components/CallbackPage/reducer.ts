import produce from 'immer';
import { State } from '~app/components/Login/components/CallbackPage/types';
import * as actionTypes from '~app/components/Login/components/CallbackPage/actionTypes';

export const initialState: State = {
  isLoading: false,
  isLoggedIn: false,
  idToken: '',
  refreshToken: '',
  error: null,
  userData: {},
};

/* eslint-disable default-case, no-param-reassign */
const loginReducer = (state = initialState, action: Action) => produce(state, (draft) => {
    switch (action.type) {
      case actionTypes.LOGIN_INIT:
        break;
      case actionTypes.LOGIN_SET_ID_TOKEN:
        draft.idToken = action.payload;
        break;
      case actionTypes.LOGIN_SET_REFRESH_TOKEN:
        draft.refreshToken = action.payload;
        break;
      case actionTypes.LOGIN_SUCCESS:
        draft.userData = { ...action.payload };
        draft.isLoggedIn = true;
        break;
      case actionTypes.LOGIN_FAILURE:
        break;
      case actionTypes.LOGOUT:
        draft.idToken = initialState.idToken;
        draft.refreshToken = initialState.refreshToken;
        draft.isLoggedIn = initialState.isLoggedIn;
        draft.userData = initialState.userData;
        break;
    }
  });

type Action = {
  type: string;
  payload: any;
};

export default loginReducer;
