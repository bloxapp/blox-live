import React from 'react';
import { shell } from 'electron';
import styled from 'styled-components';
import Icon from '../../../../../../common/components/Icon';
import { truncateText } from '../../../../../common/service';
import { compareFunction } from '../../../../../../common/components/Table/service';

const AddressKey = styled.div`
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
`;

export default [
    {
      title: '#',
      key: 'name',
      width: '10%',
      justifyContent: 'flex-start',
      compareFunction: (a, b, dir) => compareFunction('name', a, b, dir, 'string'),
      valueRender: (index, totalItems) => {
        const indexStr = index.replace('account-', '');
        const padValue = totalItems && totalItems < 100 ? 2 : 3;
        return String(parseInt(indexStr, 10) + 1).padStart(padValue, '0');
      },
    },
    {
        key: 'validationPubKey',
        title: 'Validator',
        width: '90%',
        justifyContent: 'flex-start',
        compareFunction: (a, b, dir) => compareFunction('validationPubKey', a, b, dir, 'string'),
        valueRender: (validator) => {
            const beaconchaLink = `https://beaconcha.in/validator/${validator}`;
            const openBeaconchaLink = async () => shell.openExternal(beaconchaLink);
            return (
              <>
                <AddressKey>{truncateText(`0x${validator}`, 40, 6)}</AddressKey>
                <span
                  style={{
                    alignSelf: 'center'
                  }}
                >
                  <Icon
                    style={{
                      width: 40,
                      flexDirection: 'column'
                    }}
                    onClick={openBeaconchaLink}
                    name="export"
                    fontSize="16px"
                    color="primary900" />
                </span>
              </>
            );
        }
    }
];
