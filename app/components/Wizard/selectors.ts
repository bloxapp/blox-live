export const getIsLoading = (state) => state.wizard.isLoading;

export const getWallet = (state) => state.wizard.wallet;

export const getWalletStatus = (state) => state.wizard.wallet && state.wizard.wallet.status;

export const getWalletError = (state) => state.wizard && state.wizard.error;

export const getWalletVersion = (state) => state.wizard && state.wizard.wallet && state.wizard.wallet.keyVaultVersion;

export const getDepositData = (state) => state.wizard && state.wizard.depositData;

export const getWizardFinishedStatus = (state) => state.wizard.isFinished;

export const getNetwork = (state) => state.wizard && state.wizard.network;

export const getAccount = (state) => state.wizard && state.wizard.account;
