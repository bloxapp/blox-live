import produce from 'immer';
import * as actionTypes from '~app/components/Accounts/actionTypes';
import { LOGOUT } from '~app/components/Login/components/CallbackPage/actionTypes';

const initialState = {
  isLoading: false,
  error: null,
  data: null,
  addAnotherAccount: false,
  seedlessDepositNeeded: null,
  depositNeededData: {
    isNeeded: false,
    publicKey: '',
    accountIndex: -1,
    network: '',
  }
};

/* eslint-disable default-case, no-param-reassign */
const accountsReducer = (state = initialState, action: Action) => produce(state, (draft) => {
    switch (action.type) {
      case actionTypes.LOAD_ACCOUNTS:
        draft.isLoading = true;
        break;
      case actionTypes.LOAD_ACCOUNTS_SUCCESS:
        draft.data = action.payload;
        draft.isLoading = false;
        break;
      case actionTypes.LOAD_ACCOUNTS_FAILURE:
        draft.error = action.payload;
        draft.isLoading = false;
        break;
      case actionTypes.SET_DEPOSIT_NEEDED:
        draft.depositNeededData.isNeeded = action.payload.isNeeded;
        draft.depositNeededData.publicKey = action.payload.publicKey;
        draft.depositNeededData.accountIndex = action.payload.accountIndex;
        draft.depositNeededData.network = action.payload.network;
        break;
      case actionTypes.ADD_ANOTHER_ACCOUNT:
        draft.addAnotherAccount = action.payload;
        break;
      case actionTypes.SET_SEEDLESS_DEPOSIT_NEEDED:
        console.log('asdkjasndkjhasjkdhasjkdhasjkhdasjkhdahjka');
        draft.seedlessDepositNeeded = action.payload;
        break;
      case actionTypes.CLEAR_DATA:
      case LOGOUT:
        draft.isLoading = initialState.isLoading;
        draft.error = initialState.error;
        draft.data = initialState.data;
        draft.addAnotherAccount = initialState.addAnotherAccount;
        draft.depositNeededData = initialState.depositNeededData;
        break;
    }
  });

type Action = {
  type: string;
  payload: any;
};

export default accountsReducer;
