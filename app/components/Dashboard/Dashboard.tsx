import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import config from '~app/backend/common/config';
import * as dashboardSelectors from './selectors';
import { DiscordButton } from '~app/common/components';
import EventLogs from '~app/components/Dashboard/components/EventLogs';
import { Wallet, Validators } from '~app/components/Dashboard/components';
import {
  summarizeAccounts,
  normalizeAccountsData,
  normalizeEventLogs,
  accountsHaveMoreThanOneNetwork
} from '~app/components/Dashboard/service';

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  background-color: ${({ theme }) => theme.gray50};
  display: flex;
  flex-direction: column;
  padding: 36px 94px 64px 94px;
`;

const Dashboard = (props) => {
  const { walletStatus, accounts, eventLogs,
    walletVersion, walletNeedsUpdate, bloxLiveNeedsUpdate, isTestNetHidden } = props;
  const showNetworkSwitcher = accountsHaveMoreThanOneNetwork(accounts);
  const [filteredAccounts, setFilteredAccounts] = React.useState([]);
  const [accountsSummary, setAccountsSummary] = React.useState(null);
  const [normalizedAccounts, setNormalizedAccounts] = React.useState(null);
  const [normalizedEventLogs, setNormalizedEventLogs] = React.useState(null);

  // All accounts and "network switch" effects
  React.useEffect(() => {
    if (accounts?.length) {
      setFilteredAccounts(accounts.filter((account) => {
        if (!showNetworkSwitcher) {
          return true;
        }
        if (isTestNetHidden) {
          return account.network === config.env.MAINNET_NETWORK;
        }
        return account.network === config.env.PYRMONT_NETWORK;
      }));
    } else {
      setFilteredAccounts([]);
    }
  }, [accounts, isTestNetHidden, showNetworkSwitcher]);

  // Filtered accounts after "network switch" effect
  React.useEffect(() => {
    if (filteredAccounts) {
      setAccountsSummary(summarizeAccounts(filteredAccounts));
      setNormalizedAccounts(normalizeAccountsData(filteredAccounts));
    } else {
      setNormalizedAccounts(null);
      setAccountsSummary(null);
    }
  }, [filteredAccounts]);

  // Event logs effect
  React.useEffect(() => {
    if (eventLogs) {
      setNormalizedEventLogs(normalizeEventLogs(eventLogs));
    } else {
      setNormalizedEventLogs(null);
    }
  }, [eventLogs]);

  return (
    <Wrapper>
      <Wallet
        isActive={walletStatus === 'active'}
        version={walletVersion}
        isNeedUpdate={bloxLiveNeedsUpdate}
        walletNeedsUpdate={walletNeedsUpdate}
        summary={accountsSummary}
        showNetworkSwitcher={showNetworkSwitcher}
      />

      <Validators
        accounts={normalizedAccounts}
        walletNeedsUpdate={walletNeedsUpdate}
      />

      <EventLogs events={normalizedEventLogs} />

      <DiscordButton />
    </Wrapper>
  );
};

Dashboard.propTypes = {
  walletNeedsUpdate: PropTypes.bool,
  walletStatus: PropTypes.string,
  walletVersion: PropTypes.string,
  accounts: PropTypes.array,
  eventLogs: PropTypes.array,
  bloxLiveNeedsUpdate: PropTypes.bool,
  isTestNetHidden: PropTypes.bool,
};

const mapStateToProps = (state) => ({
  isTestNetHidden: dashboardSelectors.getTestNetIsHiddenFlag(state)
});

export default connect(mapStateToProps, null)(Dashboard);
