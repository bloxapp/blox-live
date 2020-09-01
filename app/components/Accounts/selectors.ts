export const getAccounts = (state: Record<string, any>) => state.accounts && state.accounts.data;

export const getAccountsLoadingStatus = (state: Record<string, any>) => state.accounts && state.accounts.isLoading;

export const getAccountsError = (state: Record<string, any>) => state.accounts && state.accounts.error;

export const getDepositNeededStatus = (state: Record<string, any>) => state.accounts && state.accounts.depositNeeded;

export const getAddAnotherAccount = (state: Record<string, any>) => state.accounts && state.accounts.addAnotherAccount;
