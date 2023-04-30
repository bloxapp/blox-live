export const getAccounts = (state: Record<string, any>) => state.accounts?.data;

export const getFilteredAccounts = (state: Record<string, any>) => state.accounts?.filteredAccounts;

export const getAccountsSummary = (state: Record<string, any>) => state.accounts?.accountsSummary;

export const getAccountsLoadingStatus = (state: Record<string, any>) => state.accounts?.isLoading;

export const getAccountsError = (state: Record<string, any>) => state.accounts?.error;

export const getAddAnotherAccount = (state: Record<string, any>) => state.accounts?.addAnotherAccount;

export const getDepositNeededStatus = (state: Record<string, any>) => state.accounts?.depositNeededData?.isNeeded;

export const getSeedlessDepositNeededStatus = (state: Record<string, any>) => state.accounts?.seedlessDepositNeeded;

export const getDepositToPublicKey = (state: Record<string, any>) => state.accounts?.depositNeededData?.publicKey;

export const getDepositToIndex = (state: Record<string, any>) => state.accounts?.depositNeededData?.accountIndex;

export const getDepositToNetwork = (state: Record<string, any>) => state.accounts?.depositNeededData?.network;
