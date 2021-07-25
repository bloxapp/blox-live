import React from 'react';
import electron from 'electron';
import styled from 'styled-components';
const { BrowserWindow } = electron.remote;
import { Link } from '@material-ui/core';
import { truncateText } from '~app/components/common/service';
import { compareFunction } from '~app/common/components/Table/service';
import beaconChain from '../../../../../../assets/images/beacon-chain.png';

const AddressKey = styled.div`
  width: 100%;
  overflow: hidden;
  color: #3f51b5;
  white-space: nowrap;
`;

const BeaconChain = styled.div`
  width: 24px;
  height: 24px;
  display: inline-flex;
  margin-left: 10px;
  background-image: url(${beaconChain});
  background-size: cover;
  cursor: pointer;
`;
const BeaconChainText = styled.span`
`;
const FlexWrapper = styled.div`
  display: flex;
  text-align: center;
  align-items: center;
  justify-content: space-around;
`;

const openBeaconChain = (publicKey) => {
  const win = new BrowserWindow({
    // width: 1000,
    // height: 600,
  });

  win.loadURL(`http://prater.beaconcha.in/validator/${publicKey}`);
};

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
              <AddressKey>{publicKey.length > 34 ? truncateText(`0x${publicKey}`, 34, 6) : publicKey}</AddressKey>
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
                {row.deposited === true ? <FlexWrapper><BeaconChainText>Deposited</BeaconChainText><BeaconChain onClick={() => {openBeaconChain(row.publicKey)}} /></FlexWrapper> : ''}
                {row.deposited === false ? 'Not Deposited' : ''}
              </>
            );
        }
    }
];
