import React from 'react';
import PropTypes from 'prop-types';
import { ModalTemplate } from '~app/common/components';
import { Description } from '~app/common/components/ModalTemplate/components';
// @ts-ignore
import image from '../Wizard/assets/img-key-vault-inactive.svg';

const WalletMustUpgradeModal = ({onClose, text}) => {
  return (
    <ModalTemplate onClose={onClose} image={image}>
      <Description>{text}</Description>
    </ModalTemplate>
  );
};

WalletMustUpgradeModal.propTypes = {
  onClose: PropTypes.func,
  text: PropTypes.string
};

WalletMustUpgradeModal.defaultProps = {
  onClose: () => {},
  text: PropTypes.string,
};

export default WalletMustUpgradeModal;
