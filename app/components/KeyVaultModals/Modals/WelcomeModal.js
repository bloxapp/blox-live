import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'common/components';
import ModalTemplate from '../ModalTemplate';
import { Title, Description, SmallText } from '..';

import image from '../../Wizard/assets/img-key-vault-inactive.svg';

const WelcomeModal = ({onClick, onClose}) => {
  return (
    <ModalTemplate onClose={onClose} image={image}>
      <Title>Reactivating your KeyVault</Title>
      <Description>
        Due to KeyVault inactivity, your validators are not operating.
        To fix this issue, we will restart your KeyVault.
        If unsuccessful, a quick reinstall is required.
      </Description>
      <SmallText />
      <Button onClick={onClick}>Reactivate KeyVault</Button>
    </ModalTemplate>
  );
};

WelcomeModal.propTypes = {
  onClick: PropTypes.func,
  onClose: PropTypes.func,
};

export default WelcomeModal;
