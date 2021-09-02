import produce from 'immer';
import * as actionTypes from '~app/components/Wizard/actionTypes';
import { LOGOUT } from '~app/components/Login/components/CallbackPage/actionTypes';

const initialState = {
  isLoading: false,
  isDecryptingKeyStores: false,
  error: null,
  wallet: null,
  network: '',
  account: null,
  keyStores: [],
  decryptedKeyStores: [],
  keyStoreErrorMessage: '',
  shouldDisplayError: false,
  filesDecrypted: 0,
  depositData: null,
  isFinished: false,
  isOpened: false,
  pageData: {},
  page: 0,
  step: 1,
};

/* eslint-disable default-case, no-param-reassign */
const wizardReducer = (state = initialState, action: Action) => produce(state, (draft) => {
  switch (action.type) {
    case actionTypes.LOAD_WALLET:
      draft.isLoading = true;
      break;
    case actionTypes.LOAD_WALLET_SUCCESS:
      draft.isLoading = false;
      draft.wallet = action.payload;
      break;
    case actionTypes.LOAD_WALLET_FAILURE:
      draft.isLoading = false;
      draft.error = action.payload.message;
      break;

    case actionTypes.SET_NETWORK_TYPE:
      draft.network = action.payload;
      break;

    case actionTypes.GENERATE_VALIDATOR_KEY:
      draft.isLoading = true;
      break;
    case actionTypes.GENERATE_VALIDATOR_KEY_SUCCESS:
      draft.isLoading = false;
      draft.account = action.payload;
      break;
    case actionTypes.GENERATE_VALIDATOR_KEY_FAILURE:
      draft.isLoading = false;
      draft.error = action.payload;
      break;

    case actionTypes.LOAD_DEPOSIT_DATA_SUCCESS:
      draft.depositData = action.payload;
      break;
    case actionTypes.LOAD_DEPOSIT_DATA_FAILURE:
      draft.error = action.payload;
      break;
    case actionTypes.CLEAR_DEPOSIT_DATA:
      draft.depositData = initialState.depositData;
      break;

    case actionTypes.SET_FINISHED_WIZARD:
      draft.isFinished = action.payload;
      draft.isOpened = !draft.isFinished;
      break;

    case actionTypes.SET_OPENED_WIZARD:
      draft.isOpened = action.payload;
      break;

    case actionTypes.SET_WIZARD_PAGE_DATA:
      draft.pageData = action.payload;
      break;

    case actionTypes.SET_WIZARD_PAGE:
      draft.page = action.payload;
      break;

    case actionTypes.SET_WIZARD_STEP:
      draft.step = action.payload;
      break;

    case actionTypes.CLEAR_DATA:
    case LOGOUT:
      draft.isLoading = initialState.isLoading;
      draft.isFinished = initialState.isFinished;
      draft.error = initialState.error;
      draft.wallet = initialState.wallet;
      draft.network = initialState.network;
      draft.account = initialState.account;
      draft.depositData = initialState.depositData;
      draft.pageData = initialState.pageData;
      draft.page = initialState.page;
      draft.step = initialState.step;
      draft.isDecryptingKeyStores = false;
      draft.keyStores = initialState.keyStores;
      draft.decryptedKeyStores = initialState.decryptedKeyStores;
      draft.shouldDisplayError = initialState.shouldDisplayError;
      draft.keyStoreErrorMessage = initialState.keyStoreErrorMessage;
      break;
    case actionTypes.INCREMENT_FILES_DECYPTED:
      draft.filesDecrypted = action.payload;
      break;
    case actionTypes.UPLOAD_KEY_STORES:
      draft.keyStores = action.payload;
      break;
    case actionTypes.DISPLAY_KEY_STORE_ERROR:
      draft.shouldDisplayError = action.payload.status;
      draft.keyStoreErrorMessage = action.payload.message;
      break;
    case actionTypes.DECRYPT_KEY_STORES:
      draft.isDecryptingKeyStores = true;
      break;
    case actionTypes.DECRYPT_KEY_STORES_SUCCESS:
      draft.keyStoreErrorMessage = '';
      draft.shouldDisplayError = false;
      draft.isDecryptingKeyStores = false;
      draft.decryptedKeyStores = [...draft.decryptedKeyStores, ...action.payload];
      break;
    case actionTypes.CLEAR_DECRYPT_PROGRESS:
      draft.keyStores = [];
      draft.filesDecrypted = 0;
      draft.keyStoreErrorMessage = '';
      draft.shouldDisplayError = false;
      draft.isDecryptingKeyStores = false;
      draft.decryptedKeyStores = initialState.decryptedKeyStores;
      draft.shouldDisplayError = initialState.shouldDisplayError;
      draft.keyStoreErrorMessage = initialState.keyStoreErrorMessage;
      break;
    case actionTypes.CLEAR_DECRYPT_KEY_STORES:
      draft.filesDecrypted = 0;
      draft.isDecryptingKeyStores = false;
      draft.decryptedKeyStores = initialState.decryptedKeyStores;
      break;
    case actionTypes.DECRYPT_KEY_STORES_FAILURE:
      draft.filesDecrypted = 0;
      draft.shouldDisplayError = true;
      draft.isDecryptingKeyStores = false;
      draft.keyStoreErrorMessage = action.payload.message;
      draft.decryptedKeyStores = initialState.decryptedKeyStores;
      break;
  }
});

type Action = {
  type: string;
  payload: any;
};

export default wizardReducer;
