import produce from 'immer';
import * as actionTypes from '~app/components/User/actionTypes';
import { LOGOUT } from '~app/components/Login/components/CallbackPage/actionTypes';

const initialState = {
  info: null,
  isLoading: false,
  error: '',
};

/* eslint-disable default-case, no-param-reassign */
const userReducer = (state = initialState, action: Action) => produce(state, (draft) => {
  switch (action.type) {
    case actionTypes.LOAD_USER_INFO:
    case actionTypes.UPDATE_USER_INFO:
      draft.isLoading = true;
      break;
    case actionTypes.LOAD_USER_INFO_SUCCESS:
      draft.isLoading = false;
      draft.info = action.payload;
      break;
    case actionTypes.UPDATE_USER_INFO_SUCCESS:
      draft.isLoading = false;
      break;
    case actionTypes.LOAD_USER_INFO_FAILURE:
    case actionTypes.UPDATE_USER_INFO_FAILURE:
      draft.isLoading = false;
      draft.error = action.payload;
      break;
    case actionTypes.UPDATE_USER_INFO_IN_STORE:
      draft.info = { ...state.info, ...action.payload };
      break;
    case LOGOUT:
    case actionTypes.CLEAR_USER_DATA:
      draft.info = initialState.info;
      draft.isLoading = initialState.isLoading;
      draft.error = initialState.error;
  }
});

type Action = {
  type: string;
  payload: any;
};

export default userReducer;
