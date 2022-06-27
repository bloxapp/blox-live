import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {Button} from '~app/common/components';
import useRouting from '../../../../../common/hooks/useRouting';
import {longStringShorten} from "../../../../../common/components/DropZone/components/SelectedFilesTable";

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

const RewardAddress = ({address}) => {
  const {goToPage, ROUTES} = useRouting();
  const publicKey = address && `0x${longStringShorten(address?.replace('0x', ''), 4)}`;

  return (
    <Wrapper>{publicKey ?? <AddAddressButton onClick={() => { goToPage(ROUTES.REWARD_ADDRESSES); }}>Add Address</AddAddressButton>}</Wrapper>
  );
};

RewardAddress.propTypes = {
  address: PropTypes.string,
};

export default RewardAddress;
