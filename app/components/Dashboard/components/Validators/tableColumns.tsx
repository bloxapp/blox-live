import React from 'react';
import RewardAddress from './components/RewardAddress';
import { KeyCell, Status, Change, Apr, Balance } from './components';
import { compareFunction } from '~app/common/components/Table/service';

const formattedBalance = (balance: number | string | null): string | null => {
  if (!balance) {
    return null;
  }
  const floatValue = parseFloat(String(balance));
  const fractionDigits = floatValue >= 10.0 ? 5 : 9;
  return floatValue.toFixed(fractionDigits);
};

export default [
  {
    key: 'key',
    width: '40%',
    title: 'Public Key',
    justifyContent: 'flex-start',
    valueRender: (value) => <KeyCell value={value} />,
    compareFunction: (a, b, dir) => compareFunction('publicKey', a, b, dir, 'string'),
  }, {
    width: '20%',
    writable: true,
    key: 'feeRecipient',
    justifyContent: 'flex-start',
    title: 'Fee Recipent Address',
    valueRender: (value, _totalCount, item) => <RewardAddress validator={item} />,
  },
  {
    width: '10%',
    title: 'Balance',
    key: 'currentBalance',
    justifyContent: 'flex-start',
    compareFunction: (a, b, dir) => compareFunction('currentBalance', a, b, dir, 'number'),
    valueRender: (balance) => {
      return <Balance balance={formattedBalance(balance)} />;
    }
  },
  {
    width: '10%',
    key: 'change',
    title: 'Change',
    justifyContent: 'flex-start',
    compareFunction: (a, b, dir) => compareFunction('change', a, b, dir, 'number'),
    valueRender: (value, _totalCount, item) => {
      return <Change change={item.status === 'pending' ? null : formattedBalance(value)} />;
    },
  },
  {
    key: 'apr',
    width: '10%',
    title: 'Est. APR(%)',
    justifyContent: 'flex-start',
    compareFunction: (a, b, dir) => compareFunction('apr', a, b, dir, 'number'),
    valueRender: (change) => <Apr change={change} />,
  },
  {
    width: '10%',
    key: 'status',
    title: 'Status',
    justifyContent: 'flex-end',
    compareFunction: (a, b, dir) => compareFunction('status', a, b, dir, 'string'),
    valueRender: (value) => <Status status={value} />,
  }
];
