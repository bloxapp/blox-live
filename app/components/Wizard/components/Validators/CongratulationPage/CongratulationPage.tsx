import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { bindActionCreators } from 'redux';
import * as actionsFromWizard from '../../../actions';
import { SuccessIcon, Confetti } from 'common/components';
import { Title, Paragraph, BigButton } from '../../common';
import * as actionsFromAccounts from '../../../../Accounts/actions';
import useDashboardData from '../../../../Dashboard/useDashboardData';

const Wrapper = styled.div`
  position: relative;
  z-index: 2;
`;

const CongratulationPage = (props: Props) => {
  const { wizardActions, accountsActions, isImportValidators, importedValidatorsCount } = props;
  const { clearAccountsData } = accountsActions;
  const { setFinishedWizard, clearWizardData } = wizardActions;
  const { loadDashboardData } = useDashboardData();

  const onClick = async () => {
    await clearAccountsData();
    await clearWizardData();
    await setFinishedWizard(true);
    await loadDashboardData();
  };

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
            <Title color="accent2400">{importedValidatorsCount || ''} Validator(s) imported successfully</Title>
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
  isImportValidators?: boolean,
  importedValidatorsCount?: number
};

type Dispatch = (arg0: { type: string }) => any;

export default connect(null, mapDispatchToProps)(CongratulationPage);
