import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import useProcessRunner from '~app/components/ProcessRunner/useProcessRunner';
import { getNetwork, getDecryptedKeyStores } from '~app/components/Wizard/selectors';
import { Title, Paragraph, BackButton, ErrorMessage } from '~app/components/Wizard/components/common';
import {loadDepositData} from '../../../actions';
import config from '../../../../../backend/common/config';
import {setAddAnotherAccount} from '../../../../Accounts/actions';
import useDashboardData from '../../../../Dashboard/useDashboardData';
import {Checkbox, ProcessLoader} from '../../../../../common/components';
import usePasswordHandler from '../../../../PasswordHandler/usePasswordHandler';
import { SmallText } from '../../../../../common/components/ModalTemplate/components';

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
  const { setPage, setStep, decryptedKeyStores, callSetAddAnotherAccount } = props;
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
    setPage(config.WIZARD_PAGES.VALIDATOR.CONGRATULATIONS);
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
            inputData: decryptedKeyStores
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
        I'm aware that before running my validators, to avoid slashing risks, my validators needs to be offline.
      </Checkbox>
      <ButtonWrapper>
        <Button
          isDisabled={isContinueButtonDisabled}
          onClick={() => { !isContinueButtonDisabled && onNextButtonClick(); }}>
          Confirm & Run Validator with BloxStaking
        </Button>
        {isLoading && (
          <ProgressWrapper>
            {/*<ProcessLoader text={`Importing validator${account?.length === 1 ? '' : 's'}`} precentage={loaderPercentage} />*/}
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
  setPage: (page: number) => void;
  step: number;
  setStep: (page: number) => void;
  setPageData: (data: any) => void;
  network: string;
  wizardActions: Record<string, any>;
  decryptedKeyStores: Array<any>,
  callSetAddAnotherAccount: (payload: boolean) => void;
  callLoadDepositData: (publicKey: string, accountIndex: number, network: string) => void;
};

const mapStateToProps = (state: any) => ({
  network: getNetwork(state),
  decryptedKeyStores: getDecryptedKeyStores(state),
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  callLoadDepositData: (publicKey, accountIndex, network) => dispatch(loadDepositData(publicKey, accountIndex, network)),
  callSetAddAnotherAccount: (payload: boolean) => dispatch(setAddAnotherAccount(payload)),
});

type Dispatch = (arg0: { type: string }) => any;

export default connect(mapStateToProps, mapDispatchToProps)(SlashingWarning);
