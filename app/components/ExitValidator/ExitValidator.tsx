import { connect } from 'react-redux';
import {bindActionCreators} from 'redux';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
// import config from '~app/backend/common/config';
import { Checkbox } from '~app/common/components';
import Spinner from '~app/common/components/Spinner';
import useRouting from '~app/common/hooks/useRouting';
import { setWizardPage} from '~app/components/Wizard/actions';
import { MODAL_TYPES } from '~app/components/Dashboard/constants';
import * as actionsFromDashboard from '~app/components/Dashboard/actions';
import useDashboardData from '~app/components/Dashboard/useDashboardData';
// import useProcessRunner from '~app/components/ProcessRunner/useProcessRunner';
// import KeyVaultService from '~app/backend/services/key-vault/key-vault.service';
import usePasswordHandler from '~app/components/PasswordHandler/usePasswordHandler';
import { BackButton, Title, BigButton } from '~app/components/Wizard/components/common';
import { getAddAnotherAccount, getSeedlessDepositNeededStatus } from '~app/components/Accounts/selectors';
import { getPage, getPageData, getStep, getWizardFinishedStatus } from '~app/components/Wizard/selectors';

const Wrapper = styled.div`
  height: 100%;
  //margin-top: 64px;
  margin: 70px auto;
  flex-direction: column;
  //padding: 70px 150px 64px 150px;
  background-color: ${({theme}) => theme.gray50};
`;

const Text = styled.span`
  display: block;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.14;
  font-family: Avenir, serif;
  color: ${({theme}) => theme.gray600};
`;

const ErrorMessage = styled.span`
  font-size: 12px;
  font-weight: 900;
  line-height: 1.67;
  color: ${({theme}) => theme.destructive600};
  bottom:${({title}) => title ? '-27px' : '10px'};
`;

const LoaderWrapper = styled.div`
  display:flex;
  max-width:500px;
  margin-top: 8px;
`;

const LoaderText = styled.span`
  margin-left: 11px;
  font-size: 12px;
  color: ${({ theme }) => theme.primary900};
`;

const SubmitButton = styled(BigButton)`
  width: 238px;
  height: 40px;
  font-size: 16px;
  font-weight: 900;
  line-height: 1.75;
  text-align: center;
  font-style: normal;
  font-stretch: normal;
  padding: 6px 24px 8px;
  letter-spacing: normal;
  color: ${({theme}) => theme.gray50};
  cursor: ${({isDisabled}) => (isDisabled ? 'default' : 'pointer')};
  background-color: ${({ theme, isDisabled }) => isDisabled ? theme.gray400 : theme.primary900};
`;

const ExitValidator = (props: Props) => {
  const { dashboardActions, walletNeedsUpdate } = props;
  const { goToPage, ROUTES } = useRouting();
  const [checked, setChecked] = useState();
  // const keyVaultService = new KeyVaultService();
  const [error, showError] = useState('');
  // const { isDone, processData } = useProcessRunner();
  const { loadDataAfterNewAccount } = useDashboardData();
  const { checkIfPasswordIsNeeded } = usePasswordHandler();
  const [isLoading, setIsLoading] = useState(false);
  const { setModalDisplay, clearModalDisplayData } = dashboardActions;
  const [buttonEnabled, setButtonEnabled] = useState(checked && !isLoading);

  useEffect(() => {
    setButtonEnabled(checked && !isLoading);
  }, [checked, isLoading]);

  const afterPasswordValidationCallback = async () => {
    console.log('TODO: afterPasswordValidationCallback - use if necessary for state changes etc');
  };

  const startExitValidatorProcess = async () => {
    // TODO: put the call for exit validator process here
  };

  const exitValidator = async () => {
    if (buttonEnabled) {
      setIsLoading(true);
      showError('');

      if (walletNeedsUpdate) {
        const title = 'Update KeyVault';
        const confirmButtonText = title;
        setModalDisplay({
          show: true,
          type: MODAL_TYPES.UPDATE_KEYVAULT_REQUEST,
          text: 'Please update your KeyVault before adding reward addresses',
          confirmation: {
            title,
            confirmButtonText,
            cancelButtonText: 'Later',
            onConfirmButtonClick: () => {
              return checkIfPasswordIsNeeded(afterPasswordValidationCallback);
            },
            onCancelButtonClick: () => clearModalDisplayData()
          }
        });
      } else {
        await checkIfPasswordIsNeeded(afterPasswordValidationCallback);
      }

      // Start exit validator process
      await startExitValidatorProcess().then(() => {
        setIsLoading(false);
        // TODO: show success screen here
        // TODO: on success screen when "Return to Dashboard" clicked - do goToPage(ROUTES.DASHBOARD);
        loadDataAfterNewAccount().then(() => {
          // TODO: change to success screen route
          goToPage(ROUTES.DASHBOARD);
        });
      });
    }
  };

  return (
    <Wrapper>
      {!props.flowPage && (
        <BackButton onClick={() => {
          loadDataAfterNewAccount().then(() => {
            goToPage(ROUTES.DASHBOARD);
          });
          goToPage(ROUTES.DASHBOARD);
        }} />
      )}
      <Title>Exit Validator</Title>
      <Text style={{marginBottom: 16}}>
        Some text
      </Text>

      <Checkbox checked={checked} onClick={setChecked} checkboxStyle={{marginBottom: 24, marginTop: 9, marginRight: 8}}
        labelStyle={{marginBottom: 24, marginTop: 9}}>
        I understand that exiting my validator is irreversible and could take some time to be processed.
      </Checkbox>

      <SubmitButton
        isDisabled={!buttonEnabled}
        onClick={exitValidator}
      >
        Exit Validator
      </SubmitButton>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {isLoading && (
        <LoaderWrapper>
          <Spinner width="17px" />
          <LoaderText>Exiting validator..</LoaderText>
        </LoaderWrapper>
      )}
    </Wrapper>
  );
};

const mapStateToProps = (state) => ({
  page: getPage(state),
  step: getStep(state),
  pageData: getPageData(state),
  addAnotherAccount: getAddAnotherAccount(state),
  isFinishedWizard: getWizardFinishedStatus(state),
  seedLessNeedDeposit: getSeedlessDepositNeededStatus(state),
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  setPage: (page: any) => dispatch(setWizardPage(page)),
  dashboardActions: bindActionCreators(actionsFromDashboard, dispatch)
});

type Props = {
  page: number;
  step: number;
  accounts: any;
  pageData: any;
  dashboardActions: any,
  flowPage: boolean;
  isFinishedWizard: boolean;
  walletNeedsUpdate: boolean,
  addAnotherAccount: boolean;
  seedLessNeedDeposit: boolean;
  setPage: (page: number) => void;
  setStep: (page: number) => void;
  setPageData: (data: any) => void;
  wizardActions: Record<string, any>;
};

type Dispatch = (arg0: { type: string }) => any;

export default connect(mapStateToProps, mapDispatchToProps)(ExitValidator);
