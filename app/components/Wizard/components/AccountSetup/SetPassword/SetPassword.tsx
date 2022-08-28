/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import config from '~app/backend/common/config';
import { useInjectSaga } from '~app/utils/injectSaga';
import { openExternalLink } from '~app/components/common/service';
import { Button, PasswordInput, Checkbox } from 'common/components';
import useCreatePassword from '~app/common/hooks/useCreatePassword';
import Connection from '~app/backend/common/store-manager/connection';
import passwordHandlerSaga from '~app/components/PasswordHandler/saga';
import { Title, Paragraph } from '~app/components/Wizard/components/common';

const Link = styled.a`
  text-decoration:underline;
  color: ${(props) => props.theme.gray600};
  &:hover {
    color: ${(props) => props.theme.gray400};
    text-decoration:underline;
  }
  &:active {
    color: ${(props) => props.theme.gray800};
    text-decoration:underline;
  }
`;

const Wrapper = styled.div`
  width:650px;
`;

const PasswordInputsWrapper = styled.div`
  width: 454px;
  margin-top:41px;
  display: flex;
  justify-content:space-between;
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 50px;
`;

const ButtonWrapper = styled.div`
  margin-top:41px;
  margin-bottom:41px;
`;

const SetPassword = (props: SetPasswordProps) => {
  useInjectSaga({ key: 'keyvaultManagement', saga: passwordHandlerSaga, mode: ''});

  const { setStep, setPage } = props;
  const {
    password, setPassword, confirmPassword, setConfirmPassword, showPasswordError,
    showConfirmPasswordError, onPasswordBlur, onConfirmPasswordBlur } = useCreatePassword();
  const [agreementAccepted, acceptAgreement] = useState(false);

  const confirmButtonStyle = { width: 190, height: 40 };

  const inputsAreValid = () => {
    const passwordsAreEqual = password === confirmPassword;
    const passwordsHaveMoreThan8Char = password.length >= 8 && confirmPassword.length >= 8;
    return passwordsAreEqual && passwordsHaveMoreThan8Char && agreementAccepted;
  };

  const onClick = async () => {
    if (!inputsAreValid()) {
      return;
    }
    await Connection.db().setNewPassword(password);
    setStep(config.WIZARD_STEPS.VALIDATOR_SETUP);
    setPage(config.WIZARD_PAGES.WALLET.SEED_OR_KEYSTORE);
  };

  return (
    <Wrapper>
      <Title>Account Password</Title>
      <Paragraph>
        Set a strong password to secure your account.
      </Paragraph>

      <PasswordInputsWrapper>
        <PasswordInput
          name={'password'}
          title={'Password (min 8 chars)'}
          onChange={setPassword}
          value={password}
          onBlur={onPasswordBlur}
          error={showPasswordError ? 'The password is too short' : ''}
        />
        <PasswordInput
          name={'confirmPassword'}
          title={'Confirm Password'}
          onChange={setConfirmPassword}
          value={confirmPassword}
          onBlur={onConfirmPasswordBlur}
          error={showConfirmPasswordError ? 'Passwords don\'t match' : ''}
        />
      </PasswordInputsWrapper>

      <Checkbox
        checkboxStyle={{ marginRight: 5 }}
        labelStyle={{ fontSize: 12 }}
        checked={agreementAccepted}
        onClick={() => { acceptAgreement(!agreementAccepted); }}
      >
        I agree to Blox&apos;s
        &nbsp;
        <Link onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          openExternalLink('privacy-policy');
        }}>Privacy policy</Link>
        &nbsp;and
        &nbsp;
        <Link onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          openExternalLink('terms-of-use');
        }}>License and Service Agreement</Link>
      </Checkbox>

      <ButtonWrapper>
        <Button
          style={confirmButtonStyle}
          isDisabled={Boolean(showPasswordError || showConfirmPasswordError || !inputsAreValid())}
          onClick={onClick}
        >
          Confirm
        </Button>
      </ButtonWrapper>
    </Wrapper>
  );
};

type SetPasswordProps = {
  page: number;
  setPage: (page: number) => void;
  step: number;
  setStep: (page: number) => void;
};

export default connect(null, null)(SetPassword);
