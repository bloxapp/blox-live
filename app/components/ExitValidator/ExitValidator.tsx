import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import {bindActionCreators} from 'redux';
import styled from 'styled-components';
// import config from '~app/backend/common/config';
import { Checkbox } from '~app/common/components';
import Spinner from '~app/common/components/Spinner';
import { SuccessView } from 'components/SuccessView';
import useRouting from '~app/common/hooks/useRouting';
import {setWizardPage } from '~app/components/Wizard/actions';
import { getPageData } from '~app/components/Wizard/selectors';
import {openEtherscanLink} from '~app/components/common/service';
import { MODAL_TYPES } from '~app/components/Dashboard/constants';
import * as actionsFromWizard from '~app/components/Wizard/actions';
import { SecondaryButton } from '~app/common/components/Modal/Modal';
import Warning from '~app/components/Wizard/components/common/Warning';
import * as actionsFromDashboard from '~app/components/Dashboard/actions';
import useDashboardData from '~app/components/Dashboard/useDashboardData';
import useProcessRunner from '~app/components/ProcessRunner/useProcessRunner';
// import useProcessRunner from '~app/components/ProcessRunner/useProcessRunner';
// import KeyVaultService from '~app/backend/services/key-vault/key-vault.service';
import usePasswordHandler from '~app/components/PasswordHandler/usePasswordHandler';
import { BackButton, Title, BigButton, Link } from '~app/components/Wizard/components/common';
import { longStringShorten } from '~app/common/components/DropZone/components/SelectedFilesTable';

const Wrapper = styled.div`
  height: 100%;
  width: 100%;
  margin: 70px auto;
  flex-direction: column;
  background-color: ${({theme}) => theme.gray50};
  max-width: 595px;
`;

const Text = styled.span`
  display: block;
  font-size: 14px;
  font-family: Avenir, serif;
  color: ${({theme}) => theme.gray800};
`;

const Code = styled.span`
  display: flex;
  min-width: 100%;
  justify-content: space-between;
  width: 100%;
  padding: 18px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.62;
  letter-spacing: normal;
  text-align: left;
  color: #63768b;
  border: solid 1px ${({theme}) => theme.gray300};
  background-color: solid 1px ${({theme}) => theme.gray100};
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
  const { dashboardActions, walletNeedsUpdate, pageData, wizardActions } = props;
  const { setFinishedWizard } = wizardActions;
  const { goToPage, ROUTES } = useRouting();
  const [checked, setChecked] = useState(false);
  // const keyVaultService = new KeyVaultService();
  // const { isDone, processData } = useProcessRunner();
  const { loadDataAfterNewAccount } = useDashboardData();
  const { checkIfPasswordIsNeeded } = usePasswordHandler();
  const { setModalDisplay, clearModalDisplayData } = dashboardActions;
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const { isLoading, isDone, error, clearProcessState } = useProcessRunner();
  const [buttonEnabled, setButtonEnabled] = useState((checked && !isLoading) || isDone);

  useEffect(() => {
    if (!showSuccessScreen) {
      setButtonEnabled((checked && !isLoading) || isDone);
    }
  }, [checked, isLoading, isDone, showSuccessScreen]);

  const onCancelButtonClick = () => {
    clearProcessState();
    goToPage(ROUTES.DASHBOARD);
  };

  const afterPasswordValidationCallback = async () => {
    // Start exit validator process
    await startExitValidatorProcess().then(() => {
      // TODO: remove delay as it uses only for presentation of long-lasting process
      setTimeout(() => {
        return goToSuccessScreen();
      }, 5000);
    });
  };

  const startExitValidatorProcess = async () => {
    // TODO: put the call for exit validator process here
  };

  const exitValidator = async () => {
    if (buttonEnabled) {
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
            onConfirmButtonClick: async () => {
              return checkIfPasswordIsNeeded(afterPasswordValidationCallback);
            },
            onCancelButtonClick: () => clearModalDisplayData()
          }
        });
        return;
      }
      await checkIfPasswordIsNeeded(afterPasswordValidationCallback);
    }
  };

  const goToSuccessScreen = async () => {
    clearProcessState();
    await setFinishedWizard(true);
    setShowSuccessScreen(true);
  };

  const goToDashboard = async () => {
    await loadDataAfterNewAccount().then(() => {
      goToPage(ROUTES.DASHBOARD);
    });
  };

  if (showSuccessScreen) {
    return (
      <Wrapper>
        <SuccessView>
          <Text style={{marginBottom: 32}}>
            Your request to exit your validator was sent successfully to the Beacon Chain.
          </Text>
          <Text style={{marginBottom: 32}}>
            Please keep in mind that the process finalization on the Beacon Chain is not immediate and could take up to a few hours.
          </Text>
          <SubmitButton
            isDisabled={false}
            onClick={goToDashboard}
          >
            Return to Dashboard
          </SubmitButton>
        </SuccessView>
      </Wrapper>
    );
  }

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

      <Text style={{marginBottom: 16, fontSize: 16}}>
        Validator Public Key
      </Text>

      <Code style={{marginBottom: 32}}>
        {longStringShorten(pageData.publicKey, 27)}
      </Code>

      <Text style={{marginBottom: 16}}>
        Exiting from the Beacon Chain will stop your validator from validating the Ethereum network.
      </Text>

      <Text style={{marginBottom: 16}}>
        After exiting, the entire validator entire balance consisting of the 32 ETH principle and accrued rewards will be unlocked from the Beacon Chain and sent to the validator&apos;s withdrawal address.
      </Text>

      <Text style={{marginBottom: 16}}>
        Keep in mind that as withdrawals are processed within a queue, the procces of exiting your validator is not immediate and could take up to a few hours. During this time, your validator will continue to perform duties on the Beacon Chain.
      </Text>

      <Text style={{marginBottom: 32}}>
        Please refrain from making any changes to your AWS account until your see a confirmation in your dashboard that the process has been finalized.
      </Text>

      <Text style={{marginBottom: 16, fontSize: 16}}>
        Withdrawal Address
      </Text>

      <Code style={{marginBottom: 32}}>
        <div>{pageData.feeRecipient}</div>
        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
        <Link
          style={{fontSize: 14, marginLeft: 'auto', marginRight: 10}}
          onClick={async () => openEtherscanLink(`/address/${pageData.feeRecipient}`, pageData.network)}
        >
          View on Etherscan ⬈
        </Link>
      </Code>

      <Warning
        style={{marginBottom: 32, maxWidth: 'none', fontSize: 12, padding: 20}}
        text={'The process of exiting your validator is irreversible and could not be changed in the future.'}
      />

      <Checkbox
        disabled={isLoading}
        checked={checked}
        onClick={setChecked}
        checkboxStyle={{marginBottom: 24, marginTop: 9, marginRight: 8}}
        labelStyle={{marginBottom: 24, marginTop: 9, fontSize: 12}}
      >
        I understand that exiting my validator is irreversible and could take some time to be processed.
      </Checkbox>

      <div style={{display: 'flex', alignItems: 'center', alignContent: 'center', justifyContent: 'left', height: 'auto'}}>
        <div
          style={{display: 'flex', minWidth: 200, alignContent: 'center', justifyContent: 'center', marginTop: 'auto'}}
        >
          <SecondaryButton
            style={{fontSize: 16, color: '#047fff', display: 'block', maxWidth: 70}}
            onClick={!isLoading && onCancelButtonClick}
          >
            Cancel
          </SecondaryButton>
        </div>

        <SubmitButton
          isDisabled={!buttonEnabled}
          onClick={exitValidator}
        >
          Exit Validator
        </SubmitButton>
      </div>

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
  pageData: getPageData(state),
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  setPage: (page: any) => dispatch(setWizardPage(page)),
  wizardActions: bindActionCreators(actionsFromWizard, dispatch),
  dashboardActions: bindActionCreators(actionsFromDashboard, dispatch),
});

type Props = {
  pageData: any;
  dashboardActions: any,
  wizardActions: any,
  flowPage: boolean;
  walletNeedsUpdate: boolean,
  setPageData: (data: any) => void;
};

type Dispatch = (arg0: { type: string }) => any;

export default connect(mapStateToProps, mapDispatchToProps)(ExitValidator);
