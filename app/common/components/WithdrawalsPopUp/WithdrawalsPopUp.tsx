import React from 'react';
import styled from 'styled-components';
import {Icon} from 'common/components';
import useRouting from '../../hooks/useRouting';

const TextWrapper = styled.div`
  display: flex;
  margin-left: 48px;
  align-self: center;
  flex-direction: column;
`;
const FirstSectionWrapper = styled.div`
  display: flex;
`;
const BlueText = styled.span`
  color: #2536b8;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.71;
  font-style: normal;
  font-stretch: normal;
  letter-spacing: normal;
`;
const LinkText = styled.span`
  font-size: 12px;
  font-weight: 900;
  line-height: 1.67;
  font-style: normal;
  align-self: center;
  font-stretch: normal;
  letter-spacing: normal;
  color: ${({theme}) => theme.primary600};
`;
const SubText = styled.span`
  font-size: 11px;
  font-weight: 500;
  text-align: left;
  line-height: 1.45;
  font-style: normal;
  font-stretch: normal;
  letter-spacing: normal;
  color: ${({theme}) => `solid 1px ${theme.primary600}`};
`;

const Wrapper = styled.div`
  height: 84px;
  display: flex;
  cursor: pointer;
  border-radius: 8px;
  align-items: center;
  margin-bottom: 32px;
  padding: 9px 32px 6px;
  background-color: #ffffff;
  justify-content: space-between;
  &:hover {
    box-shadow: 0 4px 4px 0 rgba(37, 54, 184, 0.1);
  }
  border: ${({theme}) => `solid 1px ${theme.primary900}`};
`;

const WithdrawalsPopUp = () => {
  const { goToPage, ROUTES } = useRouting();
  const editWithdrawalAddress = () => {
    goToPage(ROUTES.WITHDRAWAL_ADDRESSES);
  };

  return (
    <Wrapper onClick={editWithdrawalAddress}>
      <FirstSectionWrapper>
        <Icon color={'gray50'} name={'discord-symbol'} fontSize={'67px'} />
        <TextWrapper>
          <BlueText>Withdrawals are here!</BlueText>
          <SubText>Stakers are now enabled to withdraw earned rewards from the Beacon Chain or exit the
            network.</SubText>
        </TextWrapper>
      </FirstSectionWrapper>
      <LinkText>Set withdrawal address</LinkText>
    </Wrapper>
  );
};

export default WithdrawalsPopUp;
