import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import {bindActionCreators} from 'redux';
import config from '~app/backend/common/config';
import { Checkbox, ProcessLoader } from '~app/common/components';
import * as actionsFromWizard from '~app/components/Wizard/actions';
import {clearDecryptProgress} from '~app/components/Wizard/actions';
import { setAddAnotherAccount } from '~app/components/Accounts/actions';
import useDashboardData from '~app/components/Dashboard/useDashboardData';
import { SmallText } from '~app/common/components/ModalTemplate/components';
import useProcessRunner from '~app/components/ProcessRunner/useProcessRunner';
import usePasswordHandler from '~app/components/PasswordHandler/usePasswordHandler';
import { getNetwork, getDecryptedKeyStores } from '~app/components/Wizard/selectors';
import { Title, Paragraph, BackButton, ErrorMessage } from '~app/components/Wizard/components/common';

const Wrapper = styled.div`
  width:650px;
`;

const ProgressWrapper = styled.div`
  width:238px;
  margin-top:20px;
`;

const ButtonWrapper = styled.div`
  margin-top:41px;
  margin-bottom:41px;
`;

const Button = styled.button<{ isDisabled }>`
  width: 320px;
  height: 40px;
  font-size: 14px;
  font-weight: 900;
  display:flex;
  align-items:center;
  justify-content:center;
  background-color: ${({theme, isDisabled}) => isDisabled ? theme.gray400 : theme.primary900};
  border-radius: 6px;
  color:${({theme}) => theme.gray50};
  border:0;
  cursor:${({isDisabled}) => isDisabled ? 'default' : 'pointer'};
`;

const SlashingWarning = (props: SlashingWarningProps) => {
  const { isLoading, isDone, processData, error, startProcess, clearProcessState, loaderPercentage, processMessage } = useProcessRunner();
  const { loadDataAfterNewAccount } = useDashboardData();
  const { checkIfPasswordIsNeeded } = usePasswordHandler();
  const { setPage, setStep, wizardActions, decryptedKeyStores, callSetAddAnotherAccount, setPageData } = props;
  const { clearDecryptKeyStores } = wizardActions;
  const [isChecked, setIsChecked] = useState(false);
  const [isContinueButtonDisabled, setContinueButtonDisabled] = useState(true);
  const account = processData && processData.length ? processData[0] : processData;
  const checkboxStyle = { marginRight: 5 };
  const checkboxLabelStyle = { fontSize: 12 };

  useEffect(() => {
    setContinueButtonDisabled(!isChecked);
  }, [isChecked]);

  useEffect(() => {
    if (isDone && account && !error) {
      onValidatorCreation();
    }
  }, [isLoading, account, error]);

  const onValidatorCreation = async () => {
    await loadDataAfterNewAccount();
    await callSetAddAnotherAccount(false);
    setPageData({
      isImportValidators: true,
      importedValidatorsCount: decryptedKeyStores.length
    });
    setPage(config.WIZARD_PAGES.VALIDATOR.CONGRATULATIONS);
    clearState();
  };

  const clearState = async () => {
    await loadDataAfterNewAccount();
    clearDecryptKeyStores();
    clearDecryptProgress();
    clearProcessState();
  };

  const onNextButtonClick = () => {
    const onSuccess = () => {
      if (error) {
        clearProcessState();
      }
      if (!isLoading) {
        startProcess('createAccount',
          `Create Validator${decryptedKeyStores.length > 0 ? 's' : ''}...`,
          {
            inputData: decryptedKeyStores.map(acc => acc.privateKey).join(','),
            deposited: true
          });
      }
    };
    checkIfPasswordIsNeeded(onSuccess);
  };

  return (
    <Wrapper>
      <BackButton onClick={() => {
        setStep(config.WIZARD_STEPS.VALIDATOR_SETUP);
        setPage(config.WIZARD_PAGES.VALIDATOR.VALIDATOR_SUMMARY);
      }} />
      <Title>Slashing Warning</Title>
      <Paragraph style={{ marginBottom: 5 }}>
        Your validators are currently active on the beacon chain:
      </Paragraph>
      <br />
      <Paragraph style={{ marginBottom: 5 }}>
        Running validators simultaneously in multiple setups will cause slashing to  <br />
        your validator
      </Paragraph>
      <br />
      <Paragraph style={{ marginBottom: 5 }}>
        To avoid slashing, <strong>shut down your existing validators setup</strong> before running <br />
        your validators with BloxStaking.
      </Paragraph>
      <br />
      <Checkbox
        checked={isChecked}
        onClick={() => { setIsChecked(!isChecked); }}
        checkboxStyle={checkboxStyle}
        labelStyle={checkboxLabelStyle}
      >
        I&apos;m aware that before running my validators, to avoid slashing risks, my validators needs to be offline.
      </Checkbox>
      <ButtonWrapper>
        <Button
          isDisabled={isContinueButtonDisabled}
          onClick={() => { !isContinueButtonDisabled && onNextButtonClick(); }}>
          Confirm & Run Validator with BloxStaking
        </Button>
        {isLoading && (
          <ProgressWrapper>
            <ProcessLoader text={processMessage} precentage={loaderPercentage} />
            <SmallText withWarning />
          </ProgressWrapper>
        )}
        {error && (
          <ErrorMessage>
            {error}, please try again.
          </ErrorMessage>
        )}
      </ButtonWrapper>
    </Wrapper>
  );
};

type SlashingWarningProps = {
  page: number;
  step: number;
  network: string;
  decryptedKeyStores: Array<any>,
  setPage: (page: number) => void;
  setStep: (page: number) => void;
  setPageData: (data: any) => void;
  wizardActions: Record<string, any>;
  callSetAddAnotherAccount: (payload: boolean) => void;
};

const mapStateToProps = (state: any) => ({
  network: getNetwork(state),
  decryptedKeyStores: getDecryptedKeyStores(state),
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  callSetAddAnotherAccount: (payload: boolean) => dispatch(setAddAnotherAccount(payload)),
  wizardActions: bindActionCreators(actionsFromWizard, dispatch),
});

type Dispatch = (arg0: { type: string }) => any;

export default connect(mapStateToProps, mapDispatchToProps)(SlashingWarning);
