import React from 'react';
import PropTypes from 'prop-types';
import { Button, FailureIcon, ModalTemplate } from 'common/components';
import { Title, Description, Wrapper } from 'common/components/ModalTemplate/components';

import image from '../Wizard/assets/img-key-vault-inactive.svg';
import { reportCrash } from '../common/service';

const FailureModal = ({ title, onClick, onClose, customImage }) => {
  const contactSupport = async () => {
    await reportCrash();
    await onClick();
  };
  return (
    <ModalTemplate onClose={onClose} image={customImage || image}>
      <Wrapper>
        <FailureIcon size={'40px'} fontSize={'30px'} />
        <Title fontSize={'32px'} color={'warning900'}>{title}</Title>
      </Wrapper>
      <Description>
        Please contact our support team to resolve this issue.
      </Description>
      <Wrapper>
        <Button onClick={contactSupport}>Contact Blox</Button> <br />
      </Wrapper>
    </ModalTemplate>
  );
};

FailureModal.propTypes = {
  title: PropTypes.string,
  onClick: PropTypes.func,
  onClose: PropTypes.func,
  customImage: PropTypes.oneOfType([PropTypes.any, undefined])
};

export default FailureModal;
