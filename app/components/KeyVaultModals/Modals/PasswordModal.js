import React, { useState } from 'react';
import styled from 'styled-components';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { shell } from 'electron';

import { Title, Description } from '..';
import ModalTemplate from '../ModalTemplate';
import { PasswordInput, Button } from 'common/components';

import * as passwordActions from '../../PasswordHandler/actions';
import * as selectors from '../../PasswordHandler/selectors';
import saga from '../../PasswordHandler/saga';
import { useInjectSaga } from 'utils/injectSaga';

import config from 'backend/common/config';

import image from '../../Wizard/assets/img-password.svg';

const key = 'password';

const Link = styled.span`
  cursor:pointer;
  color:${({theme}) => theme.primary900};
  &:hover {
    color:${({theme}) => theme.primary600};
  }
`;

const PasswordModal = (props) => {
  const { onClose, onClick, isLoading, isValid, actions } = props;
  const { checkPasswordValidation, clearPasswordData } = actions;
  const [password, setPassword] = useState('');
  const [isButtonClicked, setButtonClicked] = useState(false);
  const [showTooShortPasswordError, setTooShortPasswordErrorDisplay] = useState(false);
  const [showWrongPasswordError, setWrongPasswordErrorDisplay] = useState(false);
  const isButtonDisabled = !password || password.length < 8 || showTooShortPasswordError;

  useInjectSaga({ key, saga, mode: '' });

  React.useEffect(() => {
    if (isLoading) { return; }
    if (isButtonClicked) {
      if (isValid) {
        setTimeout(() => onPasswordValid(), 500);
      }
      else {
        setWrongPasswordErrorDisplay(true);
      }
    }
  }, [isLoading, isValid, isButtonClicked]);

  const onPasswordValid = () => {
    setWrongPasswordErrorDisplay(false);
    onClick && onClick();
    clearPasswordData();
  };

  const onPasswordBlur = () => {
    if (password.length < 8) { setTooShortPasswordErrorDisplay(true); }
    else { clearErrors(); }
  };

  const onPasswordFocus = () => clearErrors();

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      onButtonClick();
    }
  };

  const onButtonClick = () => {
    if (!isButtonDisabled) {
      setButtonClicked(true);
      checkPasswordValidation(password);
    }
  };

  const clearErrors = () => {
    setTooShortPasswordErrorDisplay(false);
    setWrongPasswordErrorDisplay(false);
    setButtonClicked(false);
  };

  const errorsHandler = () => {
    if (showTooShortPasswordError) {
      return 'The password is too short';
    }
    if (showWrongPasswordError) {
      return 'Wrong Password. Please try again';
    }
    return '';
  };

  const error = errorsHandler();

  return (
    <ModalTemplate onClose={onClose} image={image}>
      <Title>Enter your password</Title>
      <Description>Critical actions require an extra layer of security.</Description>
      <PasswordInput name={'password'} onChange={setPassword} value={password} isValid={isValid}
        onBlur={onPasswordBlur} error={error} onFocus={onPasswordFocus} onKeyDown={onKeyDown} autoFocus
      />
      <Link onClick={() => shell.openExternal(config.env.DISCORD_INVITE)}>Forgot password?</Link>
      <Button isDisabled={isButtonDisabled} onClick={onButtonClick}>Continue</Button>
    </ModalTemplate>
  );
};

PasswordModal.propTypes = {
  onClose: PropTypes.func,
  onClick: PropTypes.func,
  actions: PropTypes.object,
  isLoading: PropTypes.bool,
  isValid: PropTypes.bool,
};

const mapStateToProps = (state) => ({
  isLoading: selectors.getPasswordValidationLoadingStatus(state),
  isValid: selectors.getPasswordValidationStatus(state),
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(passwordActions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(PasswordModal);
