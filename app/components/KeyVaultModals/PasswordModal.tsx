import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { bindActionCreators } from 'redux';
import { useInjectSaga } from '~app/utils/injectSaga';
import saga from '~app/components/PasswordHandler/saga';
import useVersions from '~app/components/Versions/useVersions';
import { MODAL_TYPES } from '~app/components/Dashboard/constants';
import { openExternalLink } from '~app/components/common/service';
import Connection from '~app/backend/common/store-manager/connection';
import * as selectors from '~app/components/PasswordHandler/selectors';
import * as actionsFromDashboard from '~app/components/Dashboard/actions';
import { PasswordInput, Button, ModalTemplate } from '~app/common/components';
import * as actionsFromPassword from '~app/components/PasswordHandler/actions';
import { Title, Description } from '~app/common/components/ModalTemplate/components';
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
  const { onClose, onClick, isLoading, isValid, passwordActions, dashboardActions } = props;
  const { checkPasswordValidation, clearPasswordData } = passwordActions;
  const { setModalDisplay, clearModalDisplayData } = dashboardActions;
  const [password, setPassword] = useState('');
  const [isButtonClicked, setButtonClicked] = useState(false);
  const [showTooShortPasswordError, setTooShortPasswordErrorDisplay] = useState(false);
  const [showWrongPasswordError, setWrongPasswordErrorDisplay] = useState(false);
  const isButtonDisabled = !password || password.length < 8 || showTooShortPasswordError;
  const { bloxLiveNeedsUpdate } = useVersions();

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

  const onForgotPasswordClick = () => {
    clearModalDisplayData();
    if (bloxLiveNeedsUpdate && !Connection.db('').get('ignoreNewBloxLiveVersion')) {
      return setModalDisplay({
        show: true,
        type: MODAL_TYPES.MUST_UPDATE_APP,
        text: <div>You must update Blox app to the <a onClick={() => openExternalLink('download')}>latest version</a> before recovering your account.</div>,
        displayCloseButton: true,
      });
    }
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
      <PasswordInput name={'password'} onChange={setPassword} value={password} isValid={isValid}
        onBlur={onPasswordBlur} error={error} onFocus={onPasswordFocus} onKeyDown={onKeyDown}
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
  isLoading: PropTypes.bool,
  isValid: PropTypes.bool,
};

const mapStateToProps = (state) => ({
  isLoading: selectors.getPasswordValidationLoadingStatus(state),
  isValid: selectors.getPasswordValidationStatus(state),
});

const mapDispatchToProps = (dispatch) => ({
  passwordActions: bindActionCreators(actionsFromPassword, dispatch),
  dashboardActions: bindActionCreators(actionsFromDashboard, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(PasswordModal);
