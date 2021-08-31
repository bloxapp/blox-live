import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { bindActionCreators } from 'redux';
import useRouting from '~app/common/hooks/useRouting';
import { SuccessIcon, Confetti } from '~app/common/components';
import * as actionsFromWizard from '~app/components/Wizard/actions';
import * as actionsFromAccounts from '~app/components/Accounts/actions';
import useDashboardData from '~app/components/Dashboard/useDashboardData';
import { Title, Paragraph, BigButton } from '~app/components/Wizard/components/common';

const Wrapper = styled.div`
  position: relative;
  z-index: 2;
`;

const CongratulationPage = (props: Props) => {
  const { wizardActions, accountsActions, pageData } = props;
  const { isImportValidators, importedValidatorsCount } = pageData;
  const { clearAccountsData } = accountsActions;
  const { setFinishedWizard, setOpenedWizard, clearWizardData,
    clearDecryptKeyStores, clearDecryptProgress } = wizardActions;
  const { loadDashboardData } = useDashboardData();
  const { goToPage, ROUTES } = useRouting();

  const onClick = async () => {
    clearDecryptKeyStores();
    clearDecryptProgress();
    await clearAccountsData();
    await clearWizardData();
    await setFinishedWizard(true);
    await setOpenedWizard(false);
    await loadDashboardData();
    goToPage(ROUTES.DASHBOARD);
  };

  return (
    <>
      <Confetti />
      <Wrapper>
        <SuccessIcon />

        {!isImportValidators && (
          <>
            <Title color="accent2400" style={{ marginTop: 30 }}>Validator{importedValidatorsCount > 1 ? 's' : ''} created successfully!</Title>
            <Paragraph>
              Getting your validator{importedValidatorsCount > 1 ? 's' : ''} approved takes between 4 to 24 hours. We will <br />
              notify you via email once your validator{importedValidatorsCount > 1 ? 's' : ''} {importedValidatorsCount > 1 ? 'are' : 'is'} approved and actively staking on <br />
              the ETH 2 network. <br /> <br />

              Meanwhile, let&apos;s visit the dashboard.
            </Paragraph>
          </>
        )}

        {isImportValidators && (
          <>
            <Title color="accent2400" style={{ marginTop: 30 }}>
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
  pageData: any;
};

type Dispatch = (arg0: { type: string }) => any;

export default connect(null, mapDispatchToProps)(CongratulationPage);
