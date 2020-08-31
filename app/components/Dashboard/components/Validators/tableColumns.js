import React from 'react';
import { ClickAwayListener } from '@material-ui/core';
import { KeyCell, Status, Misc, Change, Balance } from './components';

export default [
  {
    key: 'key',
    title: 'Key',
    width: '40%',
    isSort: true,
    valueRender: (value) => {
      return <KeyCell value={value} />;
    },
  },
  {
    key: 'currentBalance',
    title: 'Balance',
    width: '20%',
    isSort: true,
    valueRender: (balance) => <Balance balance={balance} />,
  },
  {
    key: 'change',
    title: 'Change',
    width: '20%',
    isSort: true,
    valueRender: (change) => <Change change={change} />,
  },
  {
    key: 'status',
    title: 'Status',
    width: '15%',
    isSort: true,
    valueRender: (value) => <Status status={value} />,
  },
  {
    key: 'misc',
    title: '',
    width: '5%',
    valueRender: (misc) => (
      <ClickAwayListener>
        <Misc {...misc} />
      </ClickAwayListener>
    ),
  },
];
