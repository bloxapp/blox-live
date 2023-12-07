import {CHANGE_OWNER_ADDRESS} from '~app/components/Migration/actionTypes';

export const changeOwnerAddress = (address: string) => ({
    type: CHANGE_OWNER_ADDRESS,
    payload: address,
  });
