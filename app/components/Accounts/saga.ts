import Web3 from 'web3';
import { notification } from 'antd';
import { call, put, take, takeLatest, select } from 'redux-saga/effects';
import config from '~app/backend/common/config';
import * as actions from '~app/components/Accounts/actions';
import {submitFeatures} from '~app/components/Dashboard/saga';
import {getAccounts} from '~app/components/Accounts/selectors';
import { getFeatures } from '~app/components/Dashboard/selectors';
import { updateAccountStatus } from '~app/components/Wizard/actions';
import AccountService from '~app/backend/services/account/account.service';
import { LOAD_ACCOUNTS, PREPARE_ACCOUNTS } from '~app/components/Accounts/actionTypes';
import {setAccountsSummary, setFilteredAccounts} from '~app/components/Accounts/actions';
import {
  UPDATE_ACCOUNT_STATUS,
  UPDATE_ACCOUNT_STATUS_FAILURE,
  UPDATE_ACCOUNT_STATUS_SUCCESS
} from '~app/components/Wizard/actionTypes';
import {accountsHaveMoreThanOneNetwork, normalizeAccountsData, summarizeAccounts} from '~app/components/Dashboard/service';

export function* prepareAccounts(accounts: any) {
  // eslint-disable-next-line no-prototype-builtins
  if (!(accounts || {}).hasOwnProperty('payload')) {
    // eslint-disable-next-line no-param-reassign
    accounts = { payload: accounts };
  }
  if (!accounts.payload) {
    // eslint-disable-next-line no-param-reassign
    accounts.payload = yield select(getAccounts);
  }
  // eslint-disable-next-line no-param-reassign
  accounts = accounts?.payload;
  if (!accounts?.length) {
    return;
  }

  // First feature flags needed for proper dispatching of accounts
  const showNetworkSwitcher = accountsHaveMoreThanOneNetwork(accounts);
  yield call(submitFeatures, { showNetworkSwitcher });

  // Get final features
  const features = yield select(getFeatures);

  // Filter accounts
  const filtered = accounts.filter((account: any) => {
    if (!features.showNetworkSwitcher) {
      return true;
    }
    if (!features.isTestNetShow) {
      return account.network === config.env.MAINNET_NETWORK;
    }
    return account.network === config.env.PRATER_NETWORK;
  });

  // Normalize and save all accounts in storage
  const normalized = normalizeAccountsData(filtered);
  yield put(setFilteredAccounts(normalized));
  yield put(setAccountsSummary(summarizeAccounts(filtered)));

  // Calculate other features
  const newFeatures: Record<string, any> = {...features};
  // eslint-disable-next-line no-restricted-syntax
  for (const account of accounts) {
    // Exit validator enabled in accounts table
    newFeatures.exitValidatorEnabled = newFeatures.exitValidatorEnabled
      || (account.withdrawalKey.startsWith('0x01') && account.status === 'active');
  }

  // Merge popup
  const mainnetValidators = accounts.find((validator) => !validator.feeRecipient && validator.network === config.env.MAINNET_NETWORK);
  newFeatures.showMergePopUp = !features.mergePopUpSeen && mainnetValidators !== undefined;

  yield call(submitFeatures, newFeatures);
}

function* onLoadingSuccess(response: Record<string, any>) {
  yield put(actions.loadAccountsSuccess(response));
  yield call(prepareAccounts, response);
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
  yield takeLatest(PREPARE_ACCOUNTS, prepareAccounts);
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
