import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import {bindActionCreators} from 'redux';
import config from '~app/backend/common/config';
import useAccounts from '~app/components/Accounts/useAccounts';
import {MODAL_TYPES} from '~app/components/Dashboard/constants';
import Connection from '~app/backend/common/store-manager/connection';
import EventLogs from '~app/components/Dashboard/components/EventLogs';
import { normalizeEventLogs } from '~app/components/Dashboard/service';
import * as dashboardSelectors from '~app/components/Dashboard/selectors';
import * as actionsFromDashboard from '~app/components/Dashboard/actions';
import { Wallet, Validators } from '~app/components/Dashboard/components';
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
    features,
    eventLogs,
    walletStatus,
    walletVersion,
    isModalActive,
    dashboardActions,
    walletNeedsUpdate,
    callClearWizardStep,
    bloxLiveNeedsUpdate,
    callClearWizardPage,
    callClearWizardPageData
  } = props;
  const { setTestNetShowFlag } = useNetworkSwitcher();
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
  // TODO: move to event logs component
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

  React.useEffect(() => {
    const emulateMergePopUp = Connection.db('').get(config.FLAGS.FEATURES.EMULATE_MERGE_POPUP);
    if (!features.mergePopUpSeen && (features.showMergePopUp || emulateMergePopUp) && !isModalActive) {
      setTestNetShowFlag(false);
      dashboardActions.setModalDisplay({
        show: true,
        type: MODAL_TYPES.MERGE_COMING,
      });
    }
  }, []);

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
  features: PropTypes.object,
  eventLogs: PropTypes.array,
  isModalActive: PropTypes.bool,
  walletStatus: PropTypes.string,
  dashboardActions: PropTypes.any,
  walletVersion: PropTypes.string,
  walletNeedsUpdate: PropTypes.bool,
  callClearWizardPage: PropTypes.func,
  callClearWizardStep: PropTypes.func,
  bloxLiveNeedsUpdate: PropTypes.bool,
  callClearWizardPageData: PropTypes.func,
};

const mapStateToProps = (state) => ({
  features: dashboardSelectors.getFeatures(state),
  isModalActive: dashboardSelectors.getModalDisplayStatus(state),
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  callClearWizardPage: () => dispatch(clearWizardPage()),
  callClearWizardStep: () => dispatch(clearWizardStep()),
  callClearWizardPageData: () => dispatch(clearWizardPageData()),
  dashboardActions: bindActionCreators(actionsFromDashboard, dispatch),
});

type Dispatch = (arg0: { type: string }) => any;

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
