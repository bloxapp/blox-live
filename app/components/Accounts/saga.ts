import {call, put, take, takeLatest} from 'redux-saga/effects';
import {notification} from 'antd';
import Web3 from 'web3';

import {LOAD_ACCOUNTS} from './actionTypes';
import * as actions from './actions';
import {updateAccountStatus} from '../Wizard/actions';
import AccountService from '../../backend/services/account/account.service';
import {
  UPDATE_ACCOUNT_STATUS,
  UPDATE_ACCOUNT_STATUS_FAILURE,
  UPDATE_ACCOUNT_STATUS_SUCCESS
} from '../Wizard/actionTypes';
import config from '../../backend/common/config';

function* onLoadingSuccess(response: Record<string, any>) {
  yield put(actions.loadAccountsSuccess(response));
}

function* onLoadingFailure(error: Record<string, any>) {
  notification.error({message: 'Error', description: error.message});
  yield put(actions.loadAccountsFailure(error.response.data));
}

function* onGetTxReceiptSuccess(id, txHash, txReceipt) {
  if (txReceipt.status) {
    yield put(updateAccountStatus(id, txHash, true));
    yield take([UPDATE_ACCOUNT_STATUS, UPDATE_ACCOUNT_STATUS_SUCCESS, UPDATE_ACCOUNT_STATUS_FAILURE]);
  } else {
    return yield put(updateAccountStatus(id, '', false));
  }
}

function* onGetTxReceiptFailure(error) {
  notification.error({message: 'Error', description: error.message});
}

function* updateReceipt(account) {
  const {id, depositTxHash, deposited, network} = account;
  if (depositTxHash && !deposited) {
    try {
      const web3 = new Web3(getProvider(network));
      const txReceipt = yield web3.eth.getTransactionReceipt(depositTxHash);
      if (txReceipt != null) {
         yield onGetTxReceiptSuccess(id, depositTxHash, txReceipt);
      }
    } catch (error) {
      yield onGetTxReceiptFailure(error);
    }
  }
}

export function* startLoadingAccounts() {
  try {
    const accountService = new AccountService();
    const response = yield call([accountService, 'get']);
    const withTxHash = response.filter((account) => account.depositTxHash && !account.deposited);
    if (withTxHash.length === 0) {
      yield call(onLoadingSuccess, response);
      return;
    }

    yield call(updateReceipt, withTxHash[0]);
    const withUpdate = yield call([accountService, 'get']);
    yield call(onLoadingSuccess, withUpdate);
  } catch (error) {
    yield error && call(onLoadingFailure, error);
  }
}

export default function* accountsActions() {
  yield takeLatest(LOAD_ACCOUNTS, startLoadingAccounts);
}

const getProvider = (accountNetwork) => {
  let networkType;
  switch (accountNetwork) {
    case 'mainnet':
      networkType = 'mainnet';
      break;
    case 'pyrmont':
      networkType = 'goerli';
      break;
  }
  return `https://${networkType}.infura.io/v3/${config.env.INFURA_API_KEY}`;
};
