import {notification} from 'antd';
import {call, put, takeLatest} from 'redux-saga/effects';
import {LOAD_WALLET, LOAD_DEPOSIT_DATA, UPDATE_ACCOUNT_STATUS, DECRYPT_KEY_STORES} from './actionTypes';
import * as actions from './actions';
import WalletService from '../../backend/services/wallet/wallet.service';
import AccountService from '../../backend/services/account/account.service';
import {extractKeyStores} from './helpers/decreyptKeyStores';

function* onAccountStatusUpdateSuccess() {
  yield put(actions.updateAccountStatusSuccess());
}

function* onAccountStatusUpdateFailure(error) {
  yield put(actions.updateAccountStatusFailure(error));
  notification.error({message: 'Error', description: error.message});
}

function* onLoadWalletSuccess(response) {
  if (response) {
    yield put(actions.loadWalletSuccess(response));
  }
}

function* onLoadWalletFailure(error, silent?: boolean) {
  if (!silent) {
    yield put(actions.loadWalletFailure(error));
    notification.error({message: 'Error', description: error.message});
  }
}

function* onLoadDepositDataSuccess(depositData) {
  yield put(actions.loadDepositDataSuccess(depositData));
}

function* onLoadDepositDataFailure(error, silent?: boolean) {
  yield put(actions.loadDepositDataFailure(error));
  if (!silent) {
    notification.error({message: 'Error', description: error.message});
  }
}

function* loadWallet() {
  try {
    const walletService = new WalletService();
    const response = yield call([walletService, 'get']);
    yield call(onLoadWalletSuccess, response);
  } catch (error) {
    yield error && call(onLoadWalletFailure, error, !error.response?.data);
  }
}

function* loadDepositData(action) {
  const {payload} = action;
  const {publicKey, accountIndex, network} = payload;
  try {
    const accountService = new AccountService();
    const response = yield call([accountService, 'getDepositData'], publicKey, accountIndex, network);
    yield call(onLoadDepositDataSuccess, response);
  } catch (error) {
    yield error && call(onLoadDepositDataFailure, error, !error.response?.data);
  }
}

function* startUpdatingAccountStatus(action) {
  const {payload} = action;
  const {accountId, txHash, deposited} = payload;
  try {
    const accountService = new AccountService();
    yield call([accountService, 'updateStatus'], accountId, {deposited, depositTxHash: txHash});
    yield call(onAccountStatusUpdateSuccess);
  } catch (error) {
    yield error && call(onAccountStatusUpdateFailure, error);
  }
}

function* onDecryptSuccess(response) {
  if (response) {
    yield put(actions.decryptKeyStoresSuccess(response));
  }
}

function* onDecryptFailure(error, silent?: boolean) {
  if (!silent) {
    yield put(actions.decryptKeyStoresFailure(error));
    notification.error({message: 'Error', description: error.message});
  }
}

function* startDecryptKeyStores(action) {
  const {payload} = action;
  const {keyStores, password, incrementFilesDecryptedCounter} = payload;
  try {
    const keyStoresData = yield call(extractKeyStores, keyStores, password, incrementFilesDecryptedCounter);
    yield call(onDecryptSuccess, keyStoresData);
    incrementFilesDecryptedCounter(0);
  } catch (error) {
    yield call(onDecryptFailure, error);
  }
}

export default function* organizationActions() {
  yield takeLatest(LOAD_WALLET, loadWallet);
  yield takeLatest(LOAD_DEPOSIT_DATA, loadDepositData);
  yield takeLatest(UPDATE_ACCOUNT_STATUS, startUpdatingAccountStatus);
  yield takeLatest(DECRYPT_KEY_STORES, startDecryptKeyStores);
}
