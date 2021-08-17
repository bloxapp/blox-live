import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { reportCrash } from '~app/components/common/service';
import { Button, FailureIcon, ModalTemplate } from '~app/common/components';
import { Title, Description, Wrapper } from '~app/common/components/ModalTemplate/components';
// @ts-ignore
import image from '../Wizard/assets/img-key-vault-inactive.svg';

const LoaderText = styled.span`
  padding-top: 5px;
  font-size: 12px;
  color: ${({ theme }) => theme.primary900};
  min-height: 20px;
  display: block;
`;

const FailureModal = ({ title, subtitle, onClick, onClose, customImage }) => {
  const [showLoaderText, setShowLoaderText] = useState(false);
  const onSendReportClick = async () => {
    setShowLoaderText(true);
    await reportCrash();

    setTimeout(async () => {
      setShowLoaderText(false);
      await onClick();
    }, 3000);
  };
  const description = subtitle || 'Please contact our support team to resolve this issue.';

  return (
    <ModalTemplate onClose={onClose} image={customImage || image}>
      <Wrapper>
        <FailureIcon size={'40px'} fontSize={'30px'} />
        <Title color={'warning900'}>{title}</Title>
      </Wrapper>
      <Description>{description}</Description>
      <Wrapper>
        <Button
          isDisabled={showLoaderText}
          onClick={onSendReportClick}
        >
          Send Report
        </Button>
        <LoaderText>
          {showLoaderText ? 'Sending error report...' : ''} &nbsp;
        </LoaderText>
      </Wrapper>
    </ModalTemplate>
  );
};

FailureModal.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  onClick: PropTypes.func,
  onClose: PropTypes.func,
  customImage: PropTypes.any
};

FailureModal.defaultProps = {
  title: '',
  subtitle: '',
  onClick: () => {},
  onClose: null,
  customImage: null
};

export default FailureModal;
