import { useDispatch } from 'react-redux';
import { MODAL_TYPES } from '~app/components/Dashboard/constants';
import { setModalDisplay } from '~app/components/Dashboard/actions';
import Connection from '~app/backend/common/store-manager/connection';

const usePasswordHandler = () => {
  const dispatch = useDispatch();

  const checkIfPasswordIsNeeded = (onSuccess: onSuccess) => {
    if (!Connection.db().isCryptoKeyStored()) {
      return dispatch(setModalDisplay({ show: true, type: MODAL_TYPES.PASSWORD, text: '', onSuccess}));
    }
    return onSuccess();
  };
  return { checkIfPasswordIsNeeded };
};

type onSuccess = () => void;

export default usePasswordHandler;
