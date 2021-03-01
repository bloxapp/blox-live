export const getModalDisplayStatus = (state) => state.dashboard.show;

export const getModalType = (state) => state.dashboard.type;

export const getModalText = (state) => state.dashboard.text;

export const getModalOnSuccess = (state) => state.dashboard.onSuccess;

export const getModalData = (state) => state.dashboard;

export const getTestNetIsHiddenFlag = (state) => state.dashboard.testNet?.isHidden;
