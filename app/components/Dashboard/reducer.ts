import produce from 'immer';
import * as actionTypes from '~app/components/Dashboard/actionTypes';

const initialState = {
  testNet: {
    isHidden: false
  },
  dialog: {
    // Usual modal dialog attributes
    type: '',
    show: false,
    text: '',
    onSuccess: null,

    // Attributes for confirmation dialog
    confirmation: {
      title: '',
      confirmButtonText: '',
      cancelButtonText: '',
      onConfirmButtonClick: null,
      onCancelButtonClick: null
    }
  }
};

/* eslint-disable default-case, no-param-reassign */
const dashboardReducer = (state = initialState, action: Action) => produce(state, (draft) => {
  switch (action.type) {
    case actionTypes.SET_MODAL_DISPLAY:
      draft.dialog = {
        type: action.payload.type,
        show: action.payload.show,
        text: action.payload.text,
        confirmation: action.payload.confirmation ?? initialState.dialog.confirmation,
        onSuccess: action.payload.confirmation?.onConfirmButtonClick
          || action.payload.onSuccess
          || null
      };
      break;
    case actionTypes.CLEAR_MODAL_DISPLAY_DATA:
      draft.dialog = initialState.dialog;
      break;
    case actionTypes.SET_TESTNET_FLAG:
      draft.testNet.isHidden = action.payload.testNet?.isHidden || initialState.testNet.isHidden;
      break;
  }
});

type Action = {
  type: string;
  payload: any;
};

export default dashboardReducer;
