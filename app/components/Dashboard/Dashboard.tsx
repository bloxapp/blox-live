import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import config from '~app/backend/common/config';
import { Loader, DiscordButton } from '~app/common/components';
import EventLogs from '~app/components/Dashboard/components/EventLogs';
import * as dashboardSelectors from '~app/components/Dashboard/selectors';
import { Wallet, Validators } from '~app/components/Dashboard/components';
import {
  summarizeAccounts,
  normalizeAccountsData,
  normalizeEventLogs,
  accountsHaveMoreThanOneNetwork
} from '~app/components/Dashboard/service';
import useProcessRunner from '~app/components/ProcessRunner/useProcessRunner';
import { clearWizardPage, clearWizardPageData, clearWizardStep } from '~app/components/Wizard/actions';

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  background-color: ${({ theme }) => theme.gray50};
  display: flex;
  flex-direction: column;
  padding: 36px 94px 64px 94px;
`;

const Dashboard = (props) => {
  const { walletStatus, accounts, eventLogs, callClearWizardPageData,
    callClearWizardStep, callClearWizardPage, walletVersion, walletNeedsUpdate,
    bloxLiveNeedsUpdate, isTestNetShow } = props;
  const showNetworkSwitcher = accountsHaveMoreThanOneNetwork(accounts);
  const [filteredAccounts, setFilteredAccounts] = React.useState(null);
  const [accountsSummary, setAccountsSummary] = React.useState(null);
  const [normalizedAccounts, setNormalizedAccounts] = React.useState(null);
  const [normalizedEventLogs, setNormalizedEventLogs] = React.useState(null);
  const { clearProcessState, isLoading, isDone } = useProcessRunner();

  React.useEffect(() => {
    if (!isLoading && isDone) {
      clearProcessState();
    }
    callClearWizardPageData();
    callClearWizardPage();
    callClearWizardStep();
  });

  // All accounts and "network switch" effects
  React.useEffect(() => {
    if (accounts?.length) {
      setFilteredAccounts(accounts.filter((account) => {
        if (!showNetworkSwitcher) {
          return true;
        }
        if (!isTestNetShow) {
          return account.network === config.env.MAINNET_NETWORK;
        }
        return account.network === config.env.PRATER_NETWORK;
      }));
    } else {
      setFilteredAccounts(null);
    }
  }, [accounts, isTestNetShow, showNetworkSwitcher]);

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

  if (filteredAccounts?.length && !accountsSummary) {
    return <Loader />;
  }

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
        showNetworkSwitcher={showNetworkSwitcher}
      />

      <EventLogs
        events={normalizedEventLogs}
        showNetworkSwitcher={showNetworkSwitcher}
      />

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
  isTestNetShow: PropTypes.bool,
  callClearWizardPageData: PropTypes.func,
  callClearWizardPage: PropTypes.func,
  callClearWizardStep: PropTypes.func,
};

const mapStateToProps = (state) => ({
  isTestNetShow: dashboardSelectors.getTestNetShowFlag(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  callClearWizardPageData: () => dispatch(clearWizardPageData()),
  callClearWizardPage: () => dispatch(clearWizardPage()),
  callClearWizardStep: () => dispatch(clearWizardStep())
});

type Dispatch = (arg0: { type: string }) => any;

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
