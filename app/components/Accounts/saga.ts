import Web3 from 'web3';
import { notification } from 'antd';
import { call, put, take, takeLatest } from 'redux-saga/effects';
import config from '~app/backend/common/config';
import * as actions from '~app/components/Accounts/actions';
import { updateAccountStatus } from '~app/components/Wizard/actions';
import { LOAD_ACCOUNTS } from '~app/components/Accounts/actionTypes';
import AccountService from '~app/backend/services/account/account.service';
import {
  UPDATE_ACCOUNT_STATUS,
  UPDATE_ACCOUNT_STATUS_FAILURE,
  UPDATE_ACCOUNT_STATUS_SUCCESS
} from '~app/components/Wizard/actionTypes';

function* onLoadingSuccess(response: Record<string, any>) {
  yield put(actions.loadAccountsSuccess(response));
}

function* onLoadingFailure(error: Record<string, any>, silent?: boolean) {
  if (!silent) {
    notification.error({message: 'Error', description: error.message});
  }
  yield put(actions.loadAccountsFailure(error.response?.data || error));
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
    yield error && call(onLoadingFailure, error, !error.response?.data);
  }
}

export default function* accountsActions() {
  yield takeLatest(LOAD_ACCOUNTS, startLoadingAccounts);
}

const getProvider = (accountNetwork) => {
  let networkType;
  switch (accountNetwork) {
    case config.env.MAINNET_NETWORK:
      networkType = config.env.MAINNET_NETWORK;
      break;
    case config.TESTNET_NETWORK:
      networkType = config.TESTNET_NETWORK;
      break;
  }
  return `https://${networkType}.infura.io/v3/${config.env.INFURA_API_KEY}`;
};
