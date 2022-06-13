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
    title: 'Public Key',
    width: '35%',
    justifyContent: 'flex-start',
    compareFunction: (a, b, dir) => compareFunction('publicKey', a, b, dir, 'string'),
    valueRender: (value) => <KeyCell value={value} />,
  }, {
    width: '21%',
    key: 'feeRecipient',
    justifyContent: 'center',
    title: 'Proposal Rewards Address',
    compareFunction: (a, b, dir) => compareFunction('feeRecipient', a, b, dir, 'string'),
    valueRender: (value, _totalCount, item) => <RewardAddress address={item.feeRecipient} />,
  },
  {
    key: 'currentBalance',
    title: 'Balance',
    width: '10%',
    justifyContent: 'center',
    compareFunction: (a, b, dir) => compareFunction('currentBalance', a, b, dir, 'number'),
    valueRender: (balance) => {
      return <Balance balance={formattedBalance(balance)} />;
    }
  },
  {
    key: 'change',
    title: 'Change',
    width: '10%',
    justifyContent: 'center',
    compareFunction: (a, b, dir) => compareFunction('change', a, b, dir, 'number'),
    valueRender: (value, _totalCount, item) => {
      return <Change change={item.status === 'pending' ? null : formattedBalance(value)} />;
    },
  },
  {
    key: 'apr',
    title: 'Est. APR(%)',
    width: '12%',
    justifyContent: 'center',
    compareFunction: (a, b, dir) => compareFunction('apr', a, b, dir, 'number'),
    valueRender: (change) => <Apr change={change} />,
  },
  {
    key: 'status',
    title: 'Status',
    width: '12%',
    justifyContent: 'center',
    compareFunction: (a, b, dir) => compareFunction('status', a, b, dir, 'string'),
    valueRender: (value) => <Status status={value} />,
  }
];
