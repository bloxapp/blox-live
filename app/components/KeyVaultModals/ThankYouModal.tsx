import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, ModalTemplate } from '~app/common/components';
import { MODAL_TYPES } from '~app/components/Dashboard/constants';
import * as actionsFromDashboard from '~app/components/Dashboard/actions';
import { Title, Description } from '~app/common/components/ModalTemplate/components';
// @ts-ignore
import image from '../Wizard/assets/img-key-vault-inactive.svg';

const ThankYouModal = ({ onClose, type, customImage, clearModalDisplayData }) => {
  const showButton = (type !== MODAL_TYPES.DEVICE_SWITCH) && (type !== MODAL_TYPES.FORGOT_PASSWORD);

  const onCloseButtonClick = () => {
    if (typeof onClose === 'function') {
      return onClose();
    }
    clearModalDisplayData();
  };

  return (
    <ModalTemplate onClose={onClose} image={customImage || image}>
      <Title>Thank You!</Title>
      <Description>
        We will contact you as soon as possible
      </Description>
      {showButton && (<Button onClick={onCloseButtonClick}>Close</Button>)}
    </ModalTemplate>
  );
};

ThankYouModal.propTypes = {
  onClose: PropTypes.func,
  clearModalDisplayData: PropTypes.func,
  type: PropTypes.string,
  customImage: PropTypes.any
};

ThankYouModal.defaultProps = {
  onClose: null,
  type: null,
  customImage: null
};

const mapDispatchToProps = (dispatch) => ({
  clearModalDisplayData: () => dispatch(actionsFromDashboard.clearModalDisplayData())
});

export default connect(null, mapDispatchToProps)(ThankYouModal);
