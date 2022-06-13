import React from 'react';
import styled from 'styled-components';
// import { KeyCell, Status } from '~app/components/Dashboard/components/Validators/components';
// import { compareFunction } from '~app/common/components/Table/service';
import {truncateText} from '../common/service';
import x from 'assets/images/red_x.svg';

const RewardAddressInput = styled.input`
  width: 304px;
  height: 24px;
  border-radius: 2px;
  margin: 8px 0 8px 16px;
  background-color: ${({theme}) => theme.white};
  border: none;
  &:focus {
    border: 1px solid ${({theme}) => theme.gray300};
  }
`;

const ApplyToAll = styled.div`
  right: 0;
  width: 80px;
  height: 28px;
  display: none;
  font-size: 10px;
  cursor: pointer;
  font-weight: 500;
  line-height: 2.4;
  font-style: normal;
  position: absolute;
  border-radius: 4px;
  font-stretch: normal;
  padding: 2px 0 0 14px;
  letter-spacing: normal;
  color: ${({theme}) => theme.white};
  background-color: ${({theme}) => theme.primary900};
`;

const RewardAddressWrapper = styled.div`
  width: 100%;
  display: flex;
  position: relative;
  align-items: center;
  justify-content: space-between;

  &:hover {
    & div {
      display: block;
    }
  }
`;

const HeaderCell = styled.div`
  height: 20px;
  font-size: 12px;
  font-weight: 500;
  text-align: left;
  line-height: 1.67;
  font-style: normal;
  font-family: Avenir;
  font-stretch: normal;
  letter-spacing: normal;
  margin: 12px 52px 7px 16px;
  color: ${({theme}) => theme.gray800};
}`;

const PublicKeyWrapper = styled.span`
  width: 99px;
  height: 24px;
  font-size: 14px;
  font-weight: 500;
  line-height: 2;
  text-align: left;
  font-style: normal;
  font-family: Avenir;
  font-stretch: normal;
  letter-spacing: normal;
  margin: 8px 10px 8px 16px;
  color: ${({theme}) => theme.gray800};
`;

const CheckMark = styled.div`
  width: 10px;
  height: 10px;
  background-color: blue;
`;

const X = styled.div`
  width: 16px;
  height: 16px;
  font-size: 54px;
  font-weight: 500;
  line-height: 76px;
  text-align: center;
  align-items: center;
  background-size: cover;
  justify-content: center;
  background-image: url(${x});
  color: ${({ theme }) => theme.gray50};
`;

type columnsDataProps = {
  addressesVerified: object,
  validatorsRewardAddresses: object,
  applyToAll: (address: string) => void,
  onChangeAddress: (inputValue: string, publicKey: string) => void,
  verifyAddress: (inputValue: string, validatorAddress: string) => void,
};
//
// const addressStatus = (status: any) => {
//   if(status === undefined) return null;
//   if(!status) return '1';
//   return '2'ף
// };

const addressStatus = (status: any) => {
  if (status === undefined) return null;
  if (!status) return <X />;
  return <CheckMark />;
};

const columnsData = (props: columnsDataProps) => {
  const {applyToAll, verifyAddress, validatorsRewardAddresses, onChangeAddress, addressesVerified} = props;

  return [
    {
      key: '',
      title: '#',
      width: '5%',
      // compareFunction: (a, b, dir) => compareFunction('publicKey', a, b, dir, 'string'),
      valueRender: (publicKey, a, b, c) => {
        return (
          <div>
            {c > 10 ? c + 1 : `0${c + 1}`}
          </div>
        );
      }
    },
    {
      width: '23%',
      key: 'publicKey',
      title: <HeaderCell>Validator</HeaderCell>,
      // compareFunction: (a, b, dir) => compareFunction('publicKey', a, b, dir, 'string'),
      valueRender: (publicKey) => {
        return (
          <PublicKeyWrapper>{truncateText(publicKey, 6, 4)}</PublicKeyWrapper>
        );
      }
    },
    {
      width: '72%',
      key: 'rewardAddress',
      title: <HeaderCell>Proposal Rewards Address</HeaderCell>,
      // compareFunction: (a, b, dir) => compareFunction('status', a, b, dir, 'string'),
      valueRender: (a, b, validator, d) => (
        <RewardAddressWrapper>
          <RewardAddressInput
            type={'text'}
            value={validatorsRewardAddresses[validator?.publicKey]}
            onChange={(e: any) => onChangeAddress(e.target.value.trim(), validator?.publicKey)}
            onBlur={(e) => {
              verifyAddress(e.target.value.trim(), validator?.publicKey);
            }}
          />
          {addressStatus(addressesVerified[validator?.publicKey])}
          {validatorsRewardAddresses[validator?.publicKey] && (
            <ApplyToAll onClick={() => applyToAll(validatorsRewardAddresses[validator?.publicKey])}>
              Apply to all
            </ApplyToAll>
          )}
        </RewardAddressWrapper>
      )
    }
  ];
};

export default columnsData;
