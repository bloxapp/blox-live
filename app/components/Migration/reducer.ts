import produce from 'immer';
import {CHANGE_OWNER_ADDRESS} from '~app/components/Migration/actionTypes';

const initialState = {
  accountData: {
      ownerAddress: '',
    },
};

/* eslint-disable default-case, no-param-reassign */
const migrationReducer = (state = initialState, action: Action) => produce(state, (draft) => {
  switch (action.type) {
    case CHANGE_OWNER_ADDRESS:
      draft.accountData.ownerAddress = action.payload;
      break;
  }
});

type Action = {
  type: string;
  payload: any;
};

export default migrationReducer;
