import React, { useState } from 'react';
import styled from 'styled-components';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { Title, Description } from 'common/components/ModalTemplate/components';
import { PasswordInput, Button, ModalTemplate } from 'common/components';

import * as actionsFromDashboard from '../Dashboard/actions';
import { MODAL_TYPES } from '../Dashboard/constants';

import * as actionsFromPassword from '../PasswordHandler/actions';
import * as selectors from '../PasswordHandler/selectors';
import saga from '../PasswordHandler/saga';
import { useInjectSaga } from 'utils/injectSaga';

import image from '../Wizard/assets/img-password.svg';

const key = 'password';

const Link = styled.span`
  cursor:pointer;
  color:${({theme}) => theme.primary900};
  &:hover {
    color:${({theme}) => theme.primary600};
  }
`;

const PasswordModal = (props) => {
  const { onClose, onClick, isPasswordValid, passwordActions, dashboardActions } = props;
  const { checkPasswordValidation, clearPasswordData } = passwordActions;
  const { setModalDisplay, clearModalDisplayData } = dashboardActions;
  const [password, setPassword] = useState('');
  const [isButtonClicked, setButtonClicked] = useState(false);
  const [showTooShortPasswordError, setTooShortPasswordErrorDisplay] = useState(false);
  const [showWrongPasswordError, setWrongPasswordErrorDisplay] = useState(false);
  const isButtonDisabled = !password || password.length < 8 || showTooShortPasswordError;

  useInjectSaga({ key, saga, mode: '' });

  React.useEffect(() => {
    if (isButtonClicked) {
      if (isPasswordValid) {
        onPasswordValid();
      }
      else {
        setWrongPasswordErrorDisplay(true);
      }
    }
  }, [isPasswordValid, isButtonClicked]);

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

  const onForgotPasswordClick = () => {
    clearModalDisplayData();
    setModalDisplay({show: true, type: MODAL_TYPES.FORGOT_PASSWORD, text: ''});
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
      <PasswordInput name={'password'} onChange={setPassword} value={password} isValid={isPasswordValid}
        onBlur={onPasswordBlur} error={error} onFocus={onPasswordFocus} onKeyDown={onKeyDown} autoFocus
      />
      <Link onClick={onForgotPasswordClick}>Forgot password?</Link>
      <Button isDisabled={isButtonDisabled} onClick={onButtonClick}>Continue</Button>
    </ModalTemplate>
  );
};

PasswordModal.propTypes = {
  onClose: PropTypes.func,
  onClick: PropTypes.func,
  passwordActions: PropTypes.object,
  dashboardActions: PropTypes.object,
  isPasswordValid: PropTypes.bool,
};

const mapStateToProps = (state) => ({
  isPasswordValid: selectors.getPasswordValidationStatus(state),
});

const mapDispatchToProps = (dispatch) => ({
  passwordActions: bindActionCreators(actionsFromPassword, dispatch),
  dashboardActions: bindActionCreators(actionsFromDashboard, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(PasswordModal);
