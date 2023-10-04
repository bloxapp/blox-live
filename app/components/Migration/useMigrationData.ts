import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {getOwnerAddress} from '~app/components/Migration/selectors';
import {changeOwnerAddress} from '~app/components/Migration/actions';

const useMigrationData = () => {
  const dispatch = useDispatch();
  const ownerAddress = useSelector(getOwnerAddress, shallowEqual);

  const saveAddress = (address: string) => {
    dispatch(changeOwnerAddress(address));
  };

  const removeAddress = () => {
    dispatch(changeOwnerAddress(''));
  };

  return {saveAddress, removeAddress, ownerAddress};
};

export default useMigrationData;
