import React from 'react';
import PropTypes from 'prop-types';
import { SuccessIcon, Button, ModalTemplate } from '~app/common/components';
import { Title, Description, Wrapper } from '~app/common/components/ModalTemplate/components';
// @ts-ignore
import image from '../Wizard/assets/img-key-vault.svg';

const SuccessModal = ({ onSuccess, title, text }) => {
  return (
    <ModalTemplate onClose={onSuccess} image={image}>
      <Wrapper>
        <SuccessIcon size={'40px'} fontSize={'30px'} />
        <Title color={'accent2400'}>{title}</Title>
      </Wrapper>
      <Description>{text}</Description>
      <Button onClick={onSuccess}>Return to Dashboard</Button>
    </ModalTemplate>
  );
};

SuccessModal.propTypes = {
  title: PropTypes.string,
  text: PropTypes.string,
  onSuccess: PropTypes.func,
};

export default SuccessModal;
