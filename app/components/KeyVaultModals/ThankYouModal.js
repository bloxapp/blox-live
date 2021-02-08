import React from 'react';
import PropTypes from 'prop-types';
import { Button, ModalTemplate } from 'common/components';
import { Title, Description } from 'common/components/ModalTemplate/components';
import { MODAL_TYPES } from '../Dashboard/constants';

import image from '../Wizard/assets/img-key-vault-inactive.svg';

const ThankYouModal = ({ onClose, type, customImage }) => {
  const showButton = (type !== MODAL_TYPES.DEVICE_SWITCH) && (type !== MODAL_TYPES.FORGOT_PASSWORD);
  return (
    <ModalTemplate onClose={onClose} image={customImage || image}>
      <Title>Thank You!</Title>
      <Description>
        We will contact you as soon as possible
      </Description>
      {showButton && (<Button onClick={onClose}>Close</Button>)}
    </ModalTemplate>
  );
};

ThankYouModal.propTypes = {
  onClose: PropTypes.func,
  type: PropTypes.string,
  customImage: PropTypes.oneOfType([PropTypes.any, undefined])
};

export default ThankYouModal;
