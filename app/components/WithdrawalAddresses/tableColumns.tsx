import React from 'react';
import styled from 'styled-components';
import { truncateText } from '~app/components/common/service';
// @ts-ignore
import x from '~app/assets/images/red_x.svg';
// @ts-ignore
import checkmark from '~app/assets/images/v_mark.svg';

const WithdrawalAddressInput = styled.input`
  width: 304px;
  height: 24px;
  border-radius: 2px;
  font-size: 12px;
  margin: 8px 0 8px 16px;
  background-color: ${({theme}) => theme.white};
  border: solid 1px ${({theme}) => theme.gray300};
  &:focus {
    outline: none;
    border-radius: 4px;
    border: solid 1px ${({theme}) => theme.primary900};
  }
`;

const ApplyToAll = styled.div`
  right: -8px;
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

const WithdrawalAddressWrapper = styled.div`
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
  width: 13.2px;
  height: 10.1px;
  background-size: cover;
  justify-content: center;
  background-image: url(${checkmark});
  color: ${({ theme }) => theme.gray50};
`;

const X = styled.div`
  width: 16px;
  height: 16px;
  background-size: cover;
  justify-content: center;
  background-image: url(${x});
  color: ${({ theme }) => theme.gray50};
`;

type columnsDataProps = {
  validators: object,
  valueField: string,
  applyToAll: (address: string) => void,
  onChangeAddress: (inputValue: string, publicKey: string) => void,
};

const addressStatus = (value: any, error: any) => {
  if (!value) return null;
  if (error && value) return <X />;
  return <CheckMark />;
};

const columnsData = (props: columnsDataProps) => {
  const {applyToAll, validators, onChangeAddress, valueField} = props;

  return [
    {
      key: '',
      title: '#',
      width: '7%',
      valueRender: (_value, _totalCount, _item, itemIndex) => {
        const indexStr = itemIndex;
        const padValue = validators && Object.keys(validators).length < 100 ? 2 : 3;
        return String(parseInt(indexStr, 10) + 1).padStart(padValue, '0');
      },
    },
    {
      width: '23%',
      key: 'publicKey',
      title: <HeaderCell>Validator</HeaderCell>,
      // compareFunction: (a, b, dir) => compareFunction('publicKey', a, b, dir, 'string'),
      valueRender: (_value, _totalCount, item) => {
        return (
          <PublicKeyWrapper>{truncateText(item, 6, 4)}</PublicKeyWrapper>
        );
      }
    },
    {
      width: '70%',
      key: 'withdrawalAddress',
      title: <HeaderCell>Set Address</HeaderCell>,
      valueRender: (_value, _totalCount, publicKey) => {
        const value = validators[publicKey][valueField] ?? '';
        const error = validators[publicKey].error ?? '';
        return (
          <WithdrawalAddressWrapper>
            <WithdrawalAddressInput
              type={'text'}
              value={value}
              onChange={(e: any) => onChangeAddress(e.target.value.trim(), publicKey)}
            />
            {addressStatus(value, error)}
            {value && !error && Object.keys(validators).length > 1 && (
              <ApplyToAll onClick={() => applyToAll(value)}>
                Apply to all
              </ApplyToAll>
            )}
          </WithdrawalAddressWrapper>
        );
      }
    }
  ];
};

export default columnsData;
