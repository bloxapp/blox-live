import React, { useState } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import useCreatePassword from '~app/common/hooks/useCreatePassword';
import Connection from '~app/backend/common/store-manager/connection';
import { ModalTemplate, Button, PasswordInput } from '~app/common/components';
import { Title, Description } from '~app/common/components/ModalTemplate/components';
import { StepIndicator, PasswordInputsWrapper } from '~app/components/AccountRecovery/components';
// @ts-ignore
import image from 'assets/images/img-recovery.svg';

const ButtonWrapper = styled.div`
  margin-top:41px;
`;

const SeedlessPasswordStepModal = (props: SeedlessPasswordStepModalProps) => {
  const { onClick } = props;
  const { password, setPassword, confirmPassword, setConfirmPassword, showPasswordError,
    showConfirmPasswordError, onPasswordBlur, onConfirmPasswordBlur } = useCreatePassword();
  const [savingPassword, setSavingPassword] = useState(false);

  /**
   * If password inputs required in backup then show it.
   * @returns {JSX.Element|string}
   */
  const renderPasswordInputs = () => {
    return (
      <PasswordInputsWrapper style={{ flexDirection: 'column' }}>
        <PasswordInput
          width={'190px'}
          value={password}
          name={'password'}
          onChange={setPassword}
          onBlur={onPasswordBlur}
          title={'Password (min 8 chars)'}
          error={showPasswordError ? 'The password is too short' : ''}
        />
        <br />
        <PasswordInput
          width={'190px'}
          value={confirmPassword}
          name={'confirmPassword'}
          title={'Confirm Password'}
          onChange={setConfirmPassword}
          onBlur={onConfirmPasswordBlur}
          error={showConfirmPasswordError ? 'Passwords don\'t match' : ''}
        />
      </PasswordInputsWrapper>
    );
  };

  const savePassword = async () => {
    if (!inputsAreValid()) {
      return;
    }
    setSavingPassword(true);
    await Connection.db().setNewPassword(password);
    onClick && onClick();
  };

  const inputsAreValid = () => {
    const passwordsAreEqual = password === confirmPassword;
    const passwordsHaveMoreThan8Char = password.length >= 8 && confirmPassword.length >= 8;
    return passwordsAreEqual && passwordsHaveMoreThan8Char;
  };

  return (
    <ModalTemplate
      image={image}
      width="900px"
      height="560px"
      justifyContent={'initial'}
      padding={'30px 32px 30px 64px'}
    >
      <Title style={{ marginBottom: 0 }}>Recover Account Data</Title>
      <StepIndicator>Step 03</StepIndicator>
      <Description>
        Set a new password to secure your account.
      </Description>

      {renderPasswordInputs()}

      <ButtonWrapper>
        <Button
          onClick={() => savePassword()}
          isDisabled={savingPassword}
        >
          Next
        </Button>
      </ButtonWrapper>
    </ModalTemplate>
  );
};

type SeedlessPasswordStepModalProps = {
  onClick?: () => void;
  type?: string;
};

export default connect(null, null)(SeedlessPasswordStepModal);
