import React from 'react';
import { compareFunction } from '~app/common/components/Table/service';
import {
  KeyCell,
  Status,
  Change,
  Apr,
  Balance,
  RewardAddress,
  WithdrawalAddress,
  ExitValidatorDropdown
} from '~app/components/Dashboard/components/Validators/components';

const formattedBalance = (balance: number | string | null): string | null => {
  if (!balance) {
    return null;
  }
  const floatValue = parseFloat(String(balance));
  const fractionDigits = floatValue >= 10.0 ? 5 : 9;
  return floatValue.toFixed(fractionDigits);
};

const defaultTableItems: Record<string, any>[] = [
  {
    key: 'key',
    width: '30%',
    title: 'Public Key',
    justifyContent: 'flex-start',
    valueRender: (value) => <KeyCell value={value} />,
    compareFunction: (a, b, dir) => compareFunction('publicKey', a, b, dir, 'string'),
  },
  {
    width: '14.5%',
    writable: true,
    key: 'feeRecipient',
    justifyContent: 'flex-start',
    title: 'Fee Recipient Address',
    writeAction: 'reward_address',
    valueRender: (_value, _totalCount, item) => <RewardAddress validator={item} />,
  },
  {
    width: '14.5%',
    writable: true,
    key: 'withdrawalAddress',
    justifyContent: 'flex-start',
    title: 'Withdrawal Address',
    writeAction: 'withdrawal_address',
    valueRender: (_value, _totalCount, item) => <WithdrawalAddress validator={item} />,
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

/**
 * Build different sets of columns depending on different feature flags
 * @param flags
 */
export const getTableColumns = (flags: Record<string, any> = {}) => {
  if (flags.exitValidatorEnabled) {
    const lastItem: any = defaultTableItems[defaultTableItems.length - 1];

    if (lastItem.key === 'exit_validator') {
      return defaultTableItems;
    }

    lastItem.width = '7%';
    lastItem.justifyContent = 'flex-start';

    defaultTableItems.push({
      width: '3%',
      key: 'exit_validator',
      title: '',
      justifyContent: 'flex-end',
      valueRender: (_value, _totalCount, item) => <ExitValidatorDropdown validator={item} />
    });
  }
  return defaultTableItems;
};
