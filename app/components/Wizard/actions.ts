import * as actionTypes from './actionTypes';

export const loadWallet = () => ({ type: actionTypes.LOAD_WALLET });

export const loadWalletSuccess = (payload: Record<string, any>) => ({
  type: actionTypes.LOAD_WALLET_SUCCESS,
  payload,
});

export const loadWalletFailure = (error: Record<string, any>) => ({
  type: actionTypes.LOAD_WALLET_FAILURE,
  payload: error,
});

export const setNetworkType = (networkType: string) => ({
  type: actionTypes.SET_NETWORK_TYPE,
  payload: networkType,
});

export const generateValidatorKey = () => ({
  type: actionTypes.GENERATE_VALIDATOR_KEY,
});

export const generateValidatorKeySuccess = (payload: Record<string, any>) => ({
  type: actionTypes.GENERATE_VALIDATOR_KEY_SUCCESS,
  payload,
});

export const generateValidatorKeyFailure = (error: Record<string, any>) => ({
  type: actionTypes.GENERATE_VALIDATOR_KEY_FAILURE,
  payload: error,
});

export const loadDepositData = (publicKey: string, accountIndex: number, network: string) => (
  { type: actionTypes.LOAD_DEPOSIT_DATA, payload: { publicKey, accountIndex, network } }
);

export const loadDepositDataSuccess = (payload: Record<string, any>) => ({
  type: actionTypes.LOAD_DEPOSIT_DATA_SUCCESS,
  payload,
});

export const loadDepositDataFailure = (error: Record<string, any>) => ({
  type: actionTypes.LOAD_DEPOSIT_DATA_FAILURE,
  payload: error,
});

export const clearDepositData = () => ({ type: actionTypes.CLEAR_DEPOSIT_DATA});

export const updateAccountStatus = (accountId: string, txHash: string, deposited: boolean) => ({
  type: actionTypes.UPDATE_ACCOUNT_STATUS,
  payload: {accountId, txHash, deposited},
});

export const updateAccountStatusSuccess = () => ({
  type: actionTypes.UPDATE_ACCOUNT_STATUS_SUCCESS,
});

export const updateAccountStatusFailure = (error: Record<string, any>) => ({
  type: actionTypes.UPDATE_ACCOUNT_STATUS_FAILURE,
  payload: error,
});

export const setFinishedWizard = (isFinished: boolean) => ({
  type: actionTypes.SET_FINISHED_WIZARD,
  payload: isFinished,
});

export const setOpenedWizard = (isOpened: boolean) => ({
  type: actionTypes.SET_OPENED_WIZARD,
  payload: isOpened,
});

export const clearWizardData = () => ({
  type: actionTypes.CLEAR_DATA,
});

export const setWizardPageData = (data: any) => ({
  type: actionTypes.SET_WIZARD_PAGE_DATA,
  payload: data,
});

export const setWizardPage = (page: number) => ({
  type: actionTypes.SET_WIZARD_PAGE,
  payload: page,
});

export const setWizardStep = (step: number) => ({
  type: actionTypes.SET_WIZARD_STEP,
  payload: step,
});

export const clearWizardPageData = () => ({
  type: actionTypes.SET_WIZARD_PAGE_DATA,
  payload: {},
});

export const clearWizardPage = () => ({
  type: actionTypes.SET_WIZARD_PAGE,
  payload: 0,
});

export const clearWizardStep = () => ({
  type: actionTypes.SET_WIZARD_STEP,
  payload: 1,
});

export const displayKeyStoreError = (payload) => ({
  type: actionTypes.DISPLAY_KEY_STORE_ERROR,
  payload,
});

export const uploadKeyStores = (payload) => ({
  type: actionTypes.UPLOAD_KEY_STORES,
  payload,
});

export const decryptKeyStores = (payload) => ({
  type: actionTypes.DECRYPT_KEY_STORES,
  payload,
});

export const decryptKeyStoresSuccess = (payload: Record<string, any>) => ({
  type: actionTypes.DECRYPT_KEY_STORES_SUCCESS,
  payload,
});

export const decryptKeyStoresFailure = (error: Record<string, any>) => ({
  type: actionTypes.DECRYPT_KEY_STORES_FAILURE,
  payload: error
});

export const incrementFilesDecryptedCounter = (payload) => ({
  type: actionTypes.INCREMENT_FILES_DECYPTED,
  payload,
});

export const clearDecryptKeyStores = () => ({
  type: actionTypes.CLEAR_DECRYPT_KEY_STORES,
});

export const clearDecryptProgress = () => ({
  type: actionTypes.CLEAR_DECRYPT_PROGRESS,
});
