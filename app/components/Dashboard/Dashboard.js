import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import EventLogs from './components/EventLogs';
import { Wallet, Validators } from './components';
import { DiscordButton } from 'common/components';
import TestNetToggle from './components/Wallet/components/TestNetToggle';
import config from '../../backend/common/config';
import { summarizeAccounts, normalizeAccountsData, normalizeEventLogs } from './service';

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
    walletVersion, walletNeedsUpdate, bloxLiveNeedsUpdate } = props;
  const accountsSummary = (accounts && accounts.length) ? summarizeAccounts(accounts) : null;
  const normalizedAccounts = accounts && normalizeAccountsData(accounts);
  const normalizedEventLogs = eventLogs && normalizeEventLogs(eventLogs);
  const havingNotMainNetAccounts = normalizedAccounts && normalizedAccounts.filter((account) => account.network !== config.env.MAINNET_NETWORK);

  return (
    <Wrapper>
      <Wallet
        isActive={walletStatus === 'active'}
        version={walletVersion}
        isNeedUpdate={bloxLiveNeedsUpdate}
        walletNeedsUpdate={walletNeedsUpdate}
        summary={accountsSummary}
      />
      {havingNotMainNetAccounts && <TestNetToggle />}
      <Validators accounts={normalizedAccounts} />
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
};

export default Dashboard;
