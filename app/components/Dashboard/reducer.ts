import produce from 'immer';
import * as actionTypes from '~app/components/Dashboard/actionTypes';

const initialState = {
  dialog: {
    // Usual modal dialog attributes
    type: '',
    show: false,
    text: '',
    onSuccess: null,
    rewardAddressesData: null,
    displayCloseButton: true,

    // Attributes for confirmation dialog
    confirmation: {
      title: '',
      confirmButtonText: '',
      cancelButtonText: '',
      onConfirmButtonClick: null,
      onCancelButtonClick: null
    }
  },
  features: {
    isTestNetShow: false,
    showMergePopUp: false,
    mergePopUpSeen: false,
    showNetworkSwitcher: false,
    exitValidatorEnabled: false,
  },
};

/* eslint-disable default-case, no-param-reassign */
const dashboardReducer = (state = initialState, action: Action) => produce(state, (draft) => {
  switch (action.type) {
    case actionTypes.SET_MODAL_DISPLAY:
      draft.dialog = {
        type: action.payload.type,
        show: action.payload.show,
        text: action.payload.text,
        rewardAddressesData: action.payload.rewardAddressesData,
        displayCloseButton: action.payload.displayCloseButton,
        confirmation: action.payload.confirmation ?? initialState.dialog.confirmation,
        onSuccess: action.payload.confirmation?.onConfirmButtonClick
          || action.payload.onSuccess
          || null
      };
      break;
    case actionTypes.CLEAR_MODAL_DISPLAY_DATA:
      draft.dialog = initialState.dialog;
      break;
    case actionTypes.SET_FEATURES:
      draft.features = {
        ...initialState.features,
        ...state.features,
        ...action.payload
      };
      break;
  }
});

type Action = {
  type: string;
  payload: any;
};

export default dashboardReducer;
