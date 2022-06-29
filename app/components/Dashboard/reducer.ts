import produce from 'immer';
import * as actionTypes from '~app/components/Dashboard/actionTypes';

const initialState = {
  testNet: {
    show: false
  },
  dialog: {
    // Usual modal dialog attributes
    type: '',
    show: false,
    text: '',
    onSuccess: null,
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
  mergePopUpSeen: false,
};

/* eslint-disable default-case, no-param-reassign */
const dashboardReducer = (state = initialState, action: Action) => produce(state, (draft) => {
  switch (action.type) {
    case actionTypes.SET_MODAL_DISPLAY:
      draft.dialog = {
        type: action.payload.type,
        show: action.payload.show,
        text: action.payload.text,
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
    case actionTypes.SET_MODAL_MERGE_AS_SEEN:
      draft.mergePopUpSeen = true;
      break;
    case actionTypes.SET_TESTNET_FLAG:
      draft.testNet.show = action.payload.testNet?.show || initialState.testNet.show;
      break;
  }
});

type Action = {
  type: string;
  payload: any;
};

export default dashboardReducer;
