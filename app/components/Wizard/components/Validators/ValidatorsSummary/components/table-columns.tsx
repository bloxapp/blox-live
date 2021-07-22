import React from 'react';
import styled from 'styled-components';
import { Link } from '@material-ui/core';
import { truncateText } from '~app/components/common/service';
import { compareFunction } from '~app/common/components/Table/service';

const AddressKey = styled.div`
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
`;

export default [
    {
        key: 'publicKey',
        title: '#',
        width: '10%',
        justifyContent: 'flex-start',
        compareFunction: (a, b, dir) => compareFunction('publicKey', a, b, dir, 'string'),
        valueRender: (_publicKey, _totalCount, _row, rowIndex) => {
            return String(rowIndex + 1).padStart(2, '0');
        },
    },
    {
        key: 'publicKey',
        title: 'Validator',
        width: '65%',
        justifyContent: 'flex-start',
        compareFunction: (a, b, dir) => compareFunction('publicKey', a, b, dir, 'string'),
        valueRender: (publicKey) => {
            return (
              <Link href={`/${publicKey}`}>{<AddressKey>{publicKey.length > 34 ? truncateText(`0x${publicKey}`, 34, 6) : publicKey}</AddressKey>}</Link>
            );
        },
    },
    {
        key: 'deposited',
        title: 'Status',
        width: '25%',
        justifyContent: 'flex-start',
        compareFunction: (a, b, dir) => compareFunction('validationPubKey', a, b, dir, 'string'),
        valueRender: (_publicKey, _totalCount, row) => {
            return (
              <>
                {row.deposited === null ? 'Checking..' : ''}
                {row.deposited === true ? 'Deposited' : ''}
                {row.deposited === true ? 'Not Deposited' : ''}
              </>
            );
        }
    }
];
