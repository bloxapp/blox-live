import React from 'react';
import PropTypes from 'prop-types';
import { ModalTemplate } from '~app/common/components';
import { Description } from '~app/common/components/ModalTemplate/components';
// @ts-ignore
import image from '../Wizard/assets/img-key-vault-inactive.svg';

const WalletMustUpgradeModal = ({ onClose }) => {
  return (
    <ModalTemplate onClose={onClose} image={image}>
      <Description>You must update Blox app to the latest version before updating your key vault.</Description>
    </ModalTemplate>
  );
};

WalletMustUpgradeModal.propTypes = {
  onClose: PropTypes.func,
};

WalletMustUpgradeModal.defaultProps = {
  onClose: () => {},
};

export default WalletMustUpgradeModal;
