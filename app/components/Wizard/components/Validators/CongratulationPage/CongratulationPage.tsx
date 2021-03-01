import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { bindActionCreators } from 'redux';
import config from '~app/backend/common/config';
import { SuccessIcon, Confetti } from '~app/common/components';
import * as actionsFromWizard from '~app/components/Wizard/actions';
import * as actionsFromAccounts from '~app/components/Accounts/actions';
import useDashboardData from '~app/components/Dashboard/useDashboardData';
import { Title, Paragraph, BigButton } from '~app/components/Wizard/components/common';
import useNetworkSwitcher from '~app/components/Dashboard/components/NetworkSwitcher/useNetworkSwitcher';
import { getNetworkForImport } from '~app/components/Wizard/components/Validators/ImportValidators/components/helpers';

const Wrapper = styled.div`
  position: relative;
  z-index: 2;
`;

const CongratulationPage = (props: Props) => {
  const { wizardActions, accountsActions, isImportValidators, importedValidatorsCount } = props;
  const { clearAccountsData } = accountsActions;
  const { setFinishedWizard, setOpenedWizard, clearWizardData } = wizardActions;
  const { loadDashboardData } = useDashboardData();
  const { setTestNetHiddenFlag } = useNetworkSwitcher();

  const onClick = async () => {
    await clearAccountsData();
    await clearWizardData();
    await setFinishedWizard(true);
    await setOpenedWizard(false);
    await loadDashboardData();
  };

  useEffect(() => {
    setTestNetHiddenFlag(getNetworkForImport() !== config.env.PYRMONT_NETWORK);
  });

  return (
    <>
      <Confetti />
      <Wrapper>
        <SuccessIcon />

        {!isImportValidators && (
          <>
            <Title color="accent2400">Validator created successfully!</Title>
            <Paragraph>
              Approving your validator can sometime take between 4 to 24 hours. We will <br />
              notify you via email once your validator is approved and is actively staking on <br />
              the ETH 2 network. <br /> <br />

              Meanwhile, let&apos;s visit the dashboard.
            </Paragraph>
          </>
        )}

        {isImportValidators && (
          <>
            <Title color="accent2400">
              {importedValidatorsCount || ''}
              &nbsp;Validator{(importedValidatorsCount && importedValidatorsCount === 1) ? '' : 's'}
              &nbsp;imported successfully
            </Title>
            <Paragraph>
              Please note that it can take a few minutes for newly imported validators to appear in your dashboard.
            </Paragraph>
          </>
        )}

        <BigButton onClick={() => onClick()}>Continue to Dashboard</BigButton>
      </Wrapper>
    </>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  wizardActions: bindActionCreators(actionsFromWizard, dispatch),
  accountsActions: bindActionCreators(actionsFromAccounts, dispatch),
});

type Props = {
  page: number;
  setPage: (page: number) => void;
  wizardActions: Record<string, any>;
  accountsActions: Record<string, any>;
  isImportValidators?: boolean;
  importedValidatorsCount?: number;
};

type Dispatch = (arg0: { type: string }) => any;

export default connect(null, mapDispatchToProps)(CongratulationPage);
