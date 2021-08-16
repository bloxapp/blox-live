import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { bindActionCreators } from 'redux';
import { useInjectSaga } from '~app/utils/injectSaga';
import saga from '~app/components/KeyVaultManagement/saga';
import useCreatePassword from '~app/common/hooks/useCreatePassword';
import { TextArea } from '~app/components/Wizard/components/common';
import * as actionsFromKeyvault from '~app/components/KeyVaultManagement/actions';
import { Title, Description } from '~app/common/components/ModalTemplate/components';
import { ModalTemplate, Button, PasswordInput, Spinner } from '~app/common/components';
import { getIsLoading, getRecoveryValidStatus, getError } from '~app/components/KeyVaultManagement/selectors';
import { ButtonWrapper, LoadingWrapper, StepIndicator, PasswordInputsWrapper } from '~app/components/AccountRecovery/components';
// @ts-ignore
import image from 'assets/images/img-recovery.svg';

const key = 'keyvaultManagement';

const Message = styled.span<{ error?: string }>`
  font-size: 12px;
  font-weight: 900;
  line-height: 1.67;
  color: ${({theme, error}) => error ? theme.destructive600 : theme.primary900};
`;

const Step1Modal = (props: Props) => {
  useInjectSaga({key, saga, mode: ''});

  const { onClick, onClose, isLoading, isValid, error, keyvaultActions } = props;

  const { validateRecoveryCredentials, clearRecoveryCredentialsState } = keyvaultActions;
  const { password, setPassword, confirmPassword, setConfirmPassword, showPasswordError,
    showConfirmPasswordError, onPasswordBlur, onConfirmPasswordBlur } = useCreatePassword();

  const [mnemonic, setMnemonic] = React.useState('');

  React.useEffect(() => {
      if (!isLoading && !error && isValid) {
        onClick && onClick();
        clearRecoveryCredentialsState();
      }
  }, [isLoading, isValid, error]);

  const onSaveAndConfirmClick = () => {
    validateRecoveryCredentials({mnemonic, password});
  };

  const onCloseClick = () => {
      clearRecoveryCredentialsState();
      onClose && onClose();
  };

  const isButtonDisabled = isLoading || !mnemonic || !password || !confirmPassword
                          || showPasswordError || showConfirmPasswordError
                          || password !== confirmPassword;

  return (
    <ModalTemplate height={'560px'} padding={'30px 32px 30px 64px'} justifyContent={'initial'}
      onClose={onClose ? onCloseClick : null} image={image}
    >
      <Title>Recover Account Data</Title>
      <StepIndicator>Step 01</StepIndicator>
      <Description>
        To recover your account, enter your secret 24-word <br />
        passphrase and set a new password for in-app activity. <br />
        DO NOT share your passphrase or password with anyone! <br />
        Doing so will provide access to your staked funds.
      </Description>
      <TextArea width={'400px'} value={mnemonic} onChange={(value) => setMnemonic(value)} autoFocus
        placeholder={'Separate each word with a space'} isDisabled={isLoading}
      />
      <PasswordInputsWrapper>
        <PasswordInput name={'password'} width={'190px'} title={'Password (min 8 chars)'}
          onChange={setPassword} value={password} onBlur={onPasswordBlur}
          error={showPasswordError ? 'The password is too short' : ''} isDisabled={isLoading}
        />
        <PasswordInput name={'confirmPassword'} width={'190px'} title={'Confirm Password'}
          onChange={setConfirmPassword} value={confirmPassword} onBlur={onConfirmPasswordBlur}
          error={showConfirmPasswordError ? 'Passwords don\'t match' : ''} isDisabled={isLoading}
        />
      </PasswordInputsWrapper>
      <ButtonWrapper>
        <Button onClick={() => !isButtonDisabled && onSaveAndConfirmClick()} isDisabled={isButtonDisabled}>
          Save &amp; Confirm
        </Button>
        {isLoading && (
          <LoadingWrapper>
            <Spinner width={'17px'} />
            <Message>Validating passphrase...</Message>
          </LoadingWrapper>
        )}
        {error && (<Message error={error}>{error}</Message>)}
      </ButtonWrapper>
    </ModalTemplate>
  );
};

type Props = {
  onClick: () => void;
  onClose: () => void | null;
  isLoading: boolean;
  isValid: boolean;
  error: string;
  keyvaultActions: Record<string, any>;
};

const mapStateToProps = (state) => ({
  isLoading: getIsLoading(state),
  isValid: getRecoveryValidStatus(state),
  error: getError(state),
});

const mapDispatchToProps = (dispatch) => ({
  keyvaultActions: bindActionCreators(actionsFromKeyvault, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(Step1Modal);
