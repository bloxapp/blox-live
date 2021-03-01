import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { grey, blue } from '@material-ui/core/colors';
import { makeStyles } from '@material-ui/core/styles';
import { Select, MenuItem, FormControl } from '@material-ui/core';
import config from '~app/backend/common/config';
import BaseStore from '~app/backend/common/store-manager/base-store';
import useNetworkSwitcher from '~app/components/Dashboard/components/NetworkSwitcher/useNetworkSwitcher';

const NetworkSwitcherWrapper = styled.div`
  text-align: right;
  color: ${({theme}) => theme.gray600};
  margin-top: -30px;
`;

const useStyles = makeStyles(() => ({
  formControl: {
    border: 0,
    '& .MuiSelect-select:hover': {
      color: blue['900']
    },
    '& .Mui-focused': {
      '& .MuiSelect-select': {
        color: blue['900']
      }
    },
    '& .MuiSelect-select': {
      '&:focus': {
        backgroundColor: 'transparent'
      },
      color: grey['600'],
      fontSize: 12
    }
  },
  select: {
    '&:before, &:after, &:focus': {
      border: 0,
    },
    '&:hover:not(.Mui-disabled):before, &:active:not(.Mui-disabled):before, &:focus:not(.Mui-disabled):before': {
      border: 0,
    }
  },
  menuItem: {
    fontSize: 14,
    '&:hover': {
      color: blue['900']
    },
    '&.Mui-selected': {
      color: blue['900'],
      backgroundColor: 'transparent'
    }
  }
}));

const testNetConfigKey = config.FLAGS.DASHBOARD.TESTNET_HIDDEN;
const baseStore = new BaseStore();

const NetworkSwitcher = () => {
  const isConfigHideTestNet = baseStore.get(testNetConfigKey);
  const [isTestNetHidden, setTestNetHidden] = useState(Boolean(isConfigHideTestNet));
  const [selectValue, setSelectValue] = useState(isTestNetHidden ? 1 : 2);
  const { setTestNetHiddenFlag } = useNetworkSwitcher();
  const styles = useStyles();

  const handleChange = (event) => {
    const isHidden = event.target.value === 1;
    setSelectValue(isHidden ? 1 : 2);
    setTestNetHidden(isHidden);
  };

  useEffect(() => {
    setTestNetHiddenFlag(isTestNetHidden);
  }, [isTestNetHidden, selectValue]);

  return (
    <NetworkSwitcherWrapper>
      <FormControl className={styles.formControl}>
        <Select
          labelId="network-switcher-label"
          id="network-switcher-select"
          value={selectValue}
          onChange={handleChange}
          className={styles.select}
          MenuProps={{
            anchorOrigin: {
              vertical: 'bottom',
              horizontal: 'right'
            },
            transformOrigin: {
              vertical: 'top',
              horizontal: 'right'
            },
            getContentAnchorEl: null
          }}
        >
          <MenuItem
            className={styles.menuItem}
            value={1}
          >
            Mainnet Network
          </MenuItem>
          <MenuItem
            className={styles.menuItem}
            value={2}
          >
            Testnet Network
          </MenuItem>
        </Select>
      </FormControl>
    </NetworkSwitcherWrapper>
  );
};

export default connect(null, null)(NetworkSwitcher);
