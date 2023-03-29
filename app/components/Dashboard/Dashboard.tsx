import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import useAccounts from '~app/components/Accounts/useAccounts';
import EventLogs from '~app/components/Dashboard/components/EventLogs';
import { normalizeEventLogs } from '~app/components/Dashboard/service';
import { Wallet, Validators } from '~app/components/Dashboard/components';
import useProcessRunner from '~app/components/ProcessRunner/useProcessRunner';
import { Loader, DiscordButton, WithdrawalsPopUp } from '~app/common/components';
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
  const {
    eventLogs,
    walletStatus,
    walletVersion,
    walletNeedsUpdate,
    callClearWizardStep,
    bloxLiveNeedsUpdate,
    callClearWizardPage,
    callClearWizardPageData
  } = props;
  const { clearProcessState, isLoading, isDone } = useProcessRunner();
  const { isLoadingAccounts, accountsSummary, filteredAccounts } = useAccounts();
  const [normalizedEventLogs, setNormalizedEventLogs] = React.useState(null);

  React.useEffect(() => {
    if (!isLoading && isDone) {
      clearProcessState();
    }
    callClearWizardPageData();
    callClearWizardPage();
    callClearWizardStep();
  });

  // Event logs effect
  React.useEffect(() => {
    if (eventLogs) {
      setNormalizedEventLogs(normalizeEventLogs(eventLogs));
    } else {
      setNormalizedEventLogs(null);
    }
  }, [eventLogs]);

  if (isLoadingAccounts) {
    return <Loader />;
  }

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
      />
      <WithdrawalsPopUp />
      <Validators />
      <EventLogs events={normalizedEventLogs} />
      <DiscordButton />
    </Wrapper>
  );
};

Dashboard.propTypes = {
  eventLogs: PropTypes.array,
  walletStatus: PropTypes.string,
  walletVersion: PropTypes.string,
  walletNeedsUpdate: PropTypes.bool,
  callClearWizardPage: PropTypes.func,
  callClearWizardStep: PropTypes.func,
  bloxLiveNeedsUpdate: PropTypes.bool,
  callClearWizardPageData: PropTypes.func,
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  callClearWizardPage: () => dispatch(clearWizardPage()),
  callClearWizardStep: () => dispatch(clearWizardStep()),
  callClearWizardPageData: () => dispatch(clearWizardPageData()),
});

type Dispatch = (arg0: { type: string }) => any;

export default connect(null, mapDispatchToProps)(Dashboard);
