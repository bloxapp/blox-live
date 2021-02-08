import React from 'react';
import { shell } from 'electron';
import Icon from '../../../../../../common/components/Icon';
import { compareFunction } from '../../../../../../common/components/Table/service';

export default [
    {
        key: 'name',
        title: '#',
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
        justifyContent: 'flex-end',
        compareFunction: (a, b, dir) => compareFunction('validationPubKey', a, b, dir, 'string'),
        valueRender: (validator) => {
            const beaconchaLink = `https://beaconcha.in/validator/${validator}`;
            const openBeaconchaLink = async () => shell.openExternal(beaconchaLink);
            return (
              <>
                <span>{`0x${validator}`}</span>
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
