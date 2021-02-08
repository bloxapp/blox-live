import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { SuccessIcon, Confetti } from 'common/components';
import { Title, Paragraph, BigButton } from '../../common';

const Wrapper = styled.div`
  position: relative;
  z-index: 2;
`;

const CongratulationPage = (props) => {
  const { setPage, setStep, step } = props;
  const onClick = () => {
    setStep(step + 1);
    setPage(4);
  };
  return (
    <>
      <Confetti />
      <Wrapper>
        <SuccessIcon />
        <Title color="accent2400">KeyVault created successfully!</Title>
        <Paragraph>
          Your private keys have been secured in your vault. <br />
          Now, let’s create your validator.
        </Paragraph>
        <BigButton onClick={onClick}>Create a Validator</BigButton>
      </Wrapper>
    </>
  );
};

CongratulationPage.propTypes = {
  setPage: PropTypes.func,
  step: PropTypes.number,
  setStep: PropTypes.func,
};

export default CongratulationPage;
