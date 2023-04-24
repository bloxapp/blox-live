import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Button } from '~app/common/components';
import config from '~app/backend/common/config';
import useRouting from '~app/common/hooks/useRouting';
import { isVersionHigherOrEqual } from '~app/utils/service';
import Connection from '~app/backend/common/store-manager/connection';
import usePasswordHandler from '~app/components/PasswordHandler/usePasswordHandler';
import { longStringShorten } from '~app/common/components/DropZone/components/SelectedFilesTable';

const Wrapper = styled.div`
  display: flex;
`;

const AddAddressButton = styled(Button)`
  width: 98px;
  height: 30px;
  line-height: 2;
  font-size: 12px;
  font-weight: 500;
  text-align: left;
  font-style: normal;
  font-family: Avenir;
  font-stretch: normal;
  letter-spacing: normal;
  color:${({theme}) => theme.white};
  background-color:${({theme}) => theme.warning700};
`;

const WithdrawalAddress = ({validator}) => {
  const {goToPage, ROUTES} = useRouting();
  const { checkIfPasswordIsNeeded } = usePasswordHandler();
  const withdrawalKey = validator?.deposited && validator?.withdrawalKey && validator?.withdrawalKey.startsWith('0x01') ? `0x${longStringShorten(validator?.withdrawalKey.replace('0x', ''))}` : undefined;

  const showPasswordProtectedDialog = async (callback) => {
    const cryptoKey = 'temp';
    const isTemporaryCryptoKeyValid = await Connection.db().isCryptoKeyValid(cryptoKey);
    if (isTemporaryCryptoKeyValid) {
      // If temp crypto key is valid - we should set it anyway
      await Connection.db().setCryptoKey(cryptoKey);
    }

    return isTemporaryCryptoKeyValid
      ? callback()
      : checkIfPasswordIsNeeded(callback);
  };

  const goToWithdrawalAddressPage = () => {
    const keyVaultVersion = Connection.db().get('keyVaultVersion');
    const callback = () => {
      try {
        Connection.db().set('network', validator.network);
      } catch (e) {
        console.log(e.message);
      }
      goToPage(ROUTES.WITHDRAWAL_ADDRESSES);
    };
    if (isVersionHigherOrEqual(keyVaultVersion, config.env.MERGE_SUPPORTED_TAG)) {
      showPasswordProtectedDialog(callback);
    } else {
      callback();
    }
  };

  return (
    <Wrapper>
      {withdrawalKey ?? <AddAddressButton onClick={goToWithdrawalAddressPage}>Add Address</AddAddressButton>}
    </Wrapper>
  );
};

WithdrawalAddress.propTypes = {
  validator: PropTypes.any,
};

export default WithdrawalAddress;
