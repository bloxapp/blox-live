import React from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { setNetworkType } from '../../../actions';
import { Title, SubTitle, Paragraph } from '../../common';
import CustomButton from './CustomButton';
import { BUTTONS } from './constants';

const Wrapper = styled.div``;

const ButtonsWrapper = styled.div`
  width: 39vw;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const onClick = ({ page, setPage, setNetwork }: Props, network) => {
  setPage(page + 1);
  setNetwork(network);
};

const Validators = (props: Props) => (
  <Wrapper>
    <Title>Select your staking network</Title>
    <Paragraph>
      Blox let’s you stake on Eth 2.0 Mainnet or run a Testnet validator to try
      our <br />
      staking services. Currently, only our Testnet is available.
    </Paragraph>
    <Paragraph>
      We are here for your next steps. Please select your staking network and
      our <br />
      wizard will guide you through the validator creation process.
    </Paragraph>
    <SubTitle>How would you like to start?</SubTitle>
    <ButtonsWrapper>
      {BUTTONS.map((button, index) => {
        const { title, label, imageName, sticker, isDisabled } = button;
        const image = require(`components/Wizard/assets/${imageName}`);
        return (
          <CustomButton
            key={index}
            sticker={sticker}
            title={title}
            image={image.default}
            isDisabled={isDisabled}
            onClick={() => !isDisabled && onClick({ ...props }, label)}
          />
        );
      })}
    </ButtonsWrapper>
  </Wrapper>
);

type Props = {
  page: number;
  setPage: (page: number) => void;
  step: number;
  setStep: (page: number) => void;
  setNetwork: (network: string) => void;
};

const mapDispatchToProps = (dispatch) => ({
  setNetwork: (network) => dispatch(setNetworkType(network)),
});

export default connect(null, mapDispatchToProps)(Validators);
