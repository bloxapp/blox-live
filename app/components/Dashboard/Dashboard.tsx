import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { bindActionCreators } from 'redux';
import config from '~app/backend/common/config';
import EventLogs from '~app/components/Dashboard/components/EventLogs';
import * as dashboardSelectors from '~app/components/Dashboard/selectors';
import { Wallet, Validators } from '~app/components/Dashboard/components';
import {
  summarizeAccounts,
  normalizeAccountsData,
  normalizeEventLogs,
  accountsHaveMoreThanOneNetwork
} from '~app/components/Dashboard/service';
import { MODAL_TYPES } from '~app/components/Dashboard/constants';
import * as actionsFromDashboard from '~app/components/Dashboard/actions';
import useProcessRunner from '~app/components/ProcessRunner/useProcessRunner';
import { Loader, DiscordButton, WithdrawalsPopUp } from '~app/common/components';
import { clearWizardPage, clearWizardPageData, clearWizardStep } from '~app/components/Wizard/actions';
import useNetworkSwitcher from '~app/components/Dashboard/components/NetworkSwitcher/useNetworkSwitcher';

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  background-color: ${({ theme }) => theme.gray50};
  display: flex;
  flex-direction: column;
  padding: 36px 94px 64px 94px;
`;

const Dashboard = (props) => {
  const {
    accounts,
    eventLogs,
    walletStatus,
    walletVersion,
    isTestNetShow,
    isMergePopUpSeen,
    dashboardActions,
    walletNeedsUpdate,
    callClearWizardStep,
    bloxLiveNeedsUpdate,
    callClearWizardPage,
    callClearWizardPageData
  } = props;

  const {setModalDisplay, setModalMergeAsSeen} = dashboardActions;
  const { setTestNetShowFlag } = useNetworkSwitcher();
  const { clearProcessState, isLoading, isDone } = useProcessRunner();
  const showNetworkSwitcher = accountsHaveMoreThanOneNetwork(accounts);
  const [filteredAccounts, setFilteredAccounts] = React.useState(null);
  const [accountsSummary, setAccountsSummary] = React.useState(null);
  const [normalizedAccounts, setNormalizedAccounts] = React.useState(null);
  const [normalizedEventLogs, setNormalizedEventLogs] = React.useState(null);

  React.useEffect(() => {
    const mainnetValidators = accounts.find((validator) => !validator.feeRecipient && validator.network === config.env.MAINNET_NETWORK);
    if (!isMergePopUpSeen && mainnetValidators !== undefined) {
      setTestNetShowFlag(false);
      setModalDisplay({ show: true, type: MODAL_TYPES.MERGE_COMING });
      setModalMergeAsSeen();
    }

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
      <WithdrawalsPopUp />
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
  accounts: PropTypes.array,
  eventLogs: PropTypes.array,
  isTestNetShow: PropTypes.bool,
  walletStatus: PropTypes.string,
  walletVersion: PropTypes.string,
  isMergePopUpSeen: PropTypes.bool,
  dashboardActions: PropTypes.any,
  walletNeedsUpdate: PropTypes.bool,
  callClearWizardPage: PropTypes.func,
  callClearWizardStep: PropTypes.func,
  bloxLiveNeedsUpdate: PropTypes.bool,
  callClearWizardPageData: PropTypes.func,
};

const mapStateToProps = (state) => ({
  isTestNetShow: dashboardSelectors.getTestNetShowFlag(state),
  isMergePopUpSeen: dashboardSelectors.getMergePopUpSeen(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  callClearWizardPage: () => dispatch(clearWizardPage()),
  callClearWizardStep: () => dispatch(clearWizardStep()),
  callClearWizardPageData: () => dispatch(clearWizardPageData()),
  dashboardActions: bindActionCreators(actionsFromDashboard, dispatch)
});

type Dispatch = (arg0: { type: string }) => any;

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
