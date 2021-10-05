import _ from 'underscore';
import * as actionTypes from './actionTypes';

export const loadAccounts = () => ({ type: actionTypes.LOAD_ACCOUNTS });

export const loadAccountsSuccess = (accounts: Record<string, any>) => ({
  type: actionTypes.LOAD_ACCOUNTS_SUCCESS,
  payload: accounts
});

export const loadAccountsFailure = (error: Record<string, any>) => ({
  type: actionTypes.LOAD_ACCOUNTS_FAILURE,
  payload: !_.isEmpty(error) ? { ...error } : null
});

export const setDepositNeeded = (payload: boolean) => ({
  type: actionTypes.SET_DEPOSIT_NEEDED, payload
});

export const setAddAnotherAccount = (addAnotherAccount: boolean) => ({
  type: actionTypes.ADD_ANOTHER_ACCOUNT,
  payload: addAnotherAccount
});

export const setSeedlessDepositNeeded = (needDeposit: boolean | null) => ({
  type: actionTypes.SET_SEEDLESS_DEPOSIT_NEEDED,
  payload: needDeposit
});

export const clearAccountsData = () => ({ type: actionTypes.CLEAR_DATA });

type DepositNeededPayload = {
  isNeeded: boolean;
  publicKey: string;
  accountIndex: number;
  network: string;
};
