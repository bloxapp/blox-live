import produce from 'immer';
import * as actionTypes from './actionTypes';

const initialState = {
  isLoading: false,
  error: '',
};

/* eslint-disable default-case, no-param-reassign */
const userReducer = (state = initialState, action: Action) => produce(state, (draft) => {
  switch (action.type) {
    case actionTypes.UPDATE_USER:
      draft.isLoading = true;
      break;
    case actionTypes.UPDATE_USER_SUCCESS:
      draft.isLoading = false;
      break;
    case actionTypes.UPDATE_USER_FAILURE:
      draft.isLoading = false;
      break;
  }
});

type Action = {
  type: string;
  payload: any;
};

export default userReducer;
