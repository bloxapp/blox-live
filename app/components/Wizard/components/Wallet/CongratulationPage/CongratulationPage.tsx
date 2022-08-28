import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import config from '~app/backend/common/config';
import { SuccessIcon, Confetti } from '~app/common/components';
import { Title, Paragraph, BigButton } from '~app/components/Wizard/components/common';

const Wrapper = styled.div`
  position: relative;
  z-index: 2;
`;

const CongratulationPage = (props) => {
  const { setPage, setStep } = props;
  const onClick = () => {
    setPage(config.WIZARD_PAGES.ACCOUNT.SET_PASSWORD);
    setStep(config.WIZARD_STEPS.ACCOUNT_SETUP);
  };
  return (
    <>
      <Confetti />
      <Wrapper>
        <SuccessIcon />
        <Title color="accent2400" style={{ marginTop: 30 }}>KeyVault created successfully!</Title>
        <Paragraph>
          Your private keys have been secured in your vault. <br />
          Now, let&apos;s set up your account password.
        </Paragraph>
        <BigButton onClick={onClick}>Set Account Password</BigButton>
      </Wrapper>
    </>
  );
};

CongratulationPage.propTypes = {
  setPage: PropTypes.func,
  setStep: PropTypes.func,
};

export default CongratulationPage;
