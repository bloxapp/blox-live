import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Wallet, Validators, TestTask } from './components';
import { summarizeAccounts, normalizeAccountsData, normalizeEventLogs } from './service';
import EventLogs from './components/EventLogs';
import { DiscordButton } from 'common/components';

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  background-color: ${({ theme }) => theme.gray50};
  display: flex;
  flex-direction: column;
  padding: 36px 94px 64px 94px;
`;

const Dashboard = (props) => {
  const { walletStatus, accounts, eventLogs, walletNeedsUpdate, bloxLiveNeedsUpdate } = props;
  const accountsSummary = accounts && summarizeAccounts(accounts);
  const normalizedAccounts = accounts && normalizeAccountsData(accounts);
  const normalizedEventLogs = eventLogs && normalizeEventLogs(eventLogs);
  return (
    <Wrapper>
      <TestTask />
      <Wallet isActive={walletStatus === 'active'} isNeedUpdate={bloxLiveNeedsUpdate} walletNeedsUpdate={walletNeedsUpdate} summary={accountsSummary} />
      <Validators accounts={normalizedAccounts} />
      <EventLogs events={normalizedEventLogs} />
      <DiscordButton />
    </Wrapper>
  );
};

Dashboard.propTypes = {
  walletNeedsUpdate: PropTypes.bool,
  walletStatus: PropTypes.string,
  accounts: PropTypes.array,
  eventLogs: PropTypes.array,
  bloxLiveNeedsUpdate: PropTypes.bool,
};

export default Dashboard;
