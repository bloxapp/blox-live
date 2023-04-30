import React from 'react';
import styled from 'styled-components';
import { truncateText } from '~app/components/common/service';

const WithdrawalAddressWrapper = styled.div`
  width: 100%;
  display: flex;
  position: relative;
  align-items: center;
  justify-content: space-between;
  padding-left: 15px;

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

type columnsDataProps = {
  validators: object,
  valueField: string,
};

const columnsData = (props: columnsDataProps) => {
  const { validators, valueField } = props;
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
        return (
          <WithdrawalAddressWrapper>
            {value}
          </WithdrawalAddressWrapper>
        );
      }
    }
  ];
};

export default columnsData;
