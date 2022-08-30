import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { bindActionCreators } from 'redux';
import useCreateServer from '~app/common/hooks/useCreateServer';
import { getAccounts } from '~app/components/Accounts/selectors';
import { MODAL_TYPES } from '~app/components/Dashboard/constants';
import { getInputData } from '~app/utils/getInputDataForProccess';
import Connection from '~app/backend/common/store-manager/connection';
import * as actionsFromKeyvault from '~app/components/KeyVaultManagement/actions';
import * as keyvaultSelectors from '~app/components/KeyVaultManagement/selectors';
import { Title, Description } from '~app/common/components/ModalTemplate/components';
import { ModalTemplate, Button, PasswordInput, Spinner } from '~app/common/components';
import { getDecryptedKeyStores, getWalletSeedlessFlag } from '~app/components/Wizard/selectors';
import { PasswordInputsWrapper, StepIndicator, LoadingWrapper } from '~app/components/AccountRecovery/components';
// @ts-ignore
import image from 'assets/images/img-recovery.svg';

const ButtonWrapper = styled.div`
  margin-top:41px;
`;

const Message = styled.span<{ error?: string }>`
  font-size: 12px;
  font-weight: 900;
  line-height: 1.67;
  color: ${({theme, error}) => error ? theme.destructive600 : theme.primary900};
`;

const Step2Modal = (props: Props) => {
  const { onClick, areAwsKeyvsValid, isValidLoading, isValidError, keyvaultActions, type, isSeedless, accounts, decryptedKeyStores } = props;
  const { validateAwsKeys } = keyvaultActions;

  React.useEffect(() => {
    if (type === MODAL_TYPES.DEVICE_SWITCH) {
      Connection.db().set('inRecoveryProcess', true);
    }
    else if (type === MODAL_TYPES.FORGOT_PASSWORD) {
      Connection.db().set('inForgotPasswordProcess', true);
    }
  }, []);

  React.useEffect(() => {
    if (areAwsKeyvsValid && !isValidError && !isValidLoading) {
      onClick(accessKeyId, secretAccessKey);
    }
  }, [isValidLoading]);

  const onStart = () => onClick(accessKeyId, secretAccessKey);
  // In Seedless mode provide extracted keystore data to the process

  const { accessKeyId, setAccessKeyId, secretAccessKey, setSecretAccessKey, isPasswordInputDisabled, isButtonDisabled
        } = useCreateServer({ onStart, inputData: getInputData({isSeedless, accounts, decryptedKeyStores}) });

  const onButtonClick = () => validateAwsKeys({ accessKeyId, secretAccessKey });

  return (
    <ModalTemplate
      image={image}
      height="560px"
      justifyContent={'initial'}
      padding={'30px 32px 30px 64px'}
    >
      <Title>Recover Account Data</Title>
      <StepIndicator>Step 0{isSeedless ? 4 : 2}</StepIndicator>
      <Description>
        Importing your data to recover your account is an automated <br />
        process that only takes a few minutes. Provide access to your <br />
        AWS tokens below for Blox to complete this step
      </Description>
      <PasswordInputsWrapper style={{ flexDirection: 'column' }}>
        <PasswordInput
          autoFocus
          value={accessKeyId}
          name={'accessKeyId'}
          title={'Access Key ID'}
          onChange={setAccessKeyId}
          isDisabled={isPasswordInputDisabled}
        />
        <br />
        <PasswordInput
          width={'320px'}
          value={secretAccessKey}
          name={'secretAccessKey'}
          title={'Secret Access Key'}
          onChange={setSecretAccessKey}
          isDisabled={isPasswordInputDisabled}
        />
      </PasswordInputsWrapper>
      <ButtonWrapper>
        <Button onClick={() => !isButtonDisabled && onButtonClick()} isDisabled={isButtonDisabled}>Continue</Button>
        {isValidLoading && (
          <LoadingWrapper>
            <Spinner width={'17px'} />
            <Message>Validating AWS keys...</Message>
          </LoadingWrapper>
        )}
        {isValidError && (
          <Message error={isValidError}>Please check your access keys and try again</Message>
        )}
      </ButtonWrapper>
    </ModalTemplate>
  );
};

const mapStateToProps = (state) => ({
  accounts: getAccounts(state),
  isSeedless: getWalletSeedlessFlag(state),
  isValidError: keyvaultSelectors.getError(state),
  decryptedKeyStores: getDecryptedKeyStores(state),
  isValidLoading: keyvaultSelectors.getIsLoading(state),
  areAwsKeyvsValid: keyvaultSelectors.getAwsKeysValidStatus(state)
});

const mapDispatchToProps = (dispatch) => ({
  keyvaultActions: bindActionCreators(actionsFromKeyvault, dispatch),
});

type Props = {
  type: string;
  accounts: Array<any>;
  isSeedless?: boolean;
  isValidError: string;
  isValidLoading: boolean;
  areAwsKeyvsValid: boolean;
  decryptedKeyStores: Array<any>;
  keyvaultActions: Record<string, any>;
  onClick: (accessKeyId: any, secretAccessKey: any) => void;
};

export default connect(mapStateToProps, mapDispatchToProps)(Step2Modal);
