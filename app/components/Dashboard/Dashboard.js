import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Wallet, Validators } from './components';
import { summarizeAccounts, normalizeAccountsData } from './service';

const Wrapper = styled.div`
  width: 100%;
  height: calc(100vh - 70px);
  background-color: ${({ theme }) => theme.gray50};
  display: flex;
  flex-direction: column;
  padding: 44px 94px;
`;

const Dashboard = (props) => {
  const { walletStatus, accounts } = props;
  const accountsSummary = accounts && summarizeAccounts(accounts);
  const normalizedAccounts = accounts && normalizeAccountsData(accounts);
  return (
    <Wrapper>
      <Wallet isActive={walletStatus === 'active'} summary={accountsSummary} />
      <Validators accounts={normalizedAccounts} />
    </Wrapper>
  );
};

Dashboard.propTypes = {
  walletStatus: PropTypes.string,
  accounts: PropTypes.array,
};

export default Dashboard;
