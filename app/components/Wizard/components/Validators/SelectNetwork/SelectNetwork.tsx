import React from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import config from '~app/backend/common/config';
import { setNetworkType } from '~app/components/Wizard/actions';
import { NETWORKS } from '~app/components/Wizard/components/Validators/constants';
import { getUserData } from '~app/components/Login/components/CallbackPage/selectors';
import { Title, SubTitle, Paragraph } from '~app/components/Wizard/components/common';
import CustomButton from '~app/components/Wizard/components/Validators/SelectNetwork/CustomButton';

const Wrapper = styled.div`
  width:650px;
`;

const ButtonsWrapper = styled.div`
  width:100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const onClick = ({ setPage, setNetwork }: Props, network) => {
  setPage(config.WIZARD_PAGES.VALIDATOR.CREATE_VALIDATOR);
  setNetwork(network);
};

const Validators = (props: Props) => {
  return (
    <Wrapper>
      <Title>Select your Staking network</Title>
      <Paragraph>
        Blox let’s you stake on the Eth2 Mainnet or run a Testnet validator to try
        our <br />
        staking services. Please select your staking network and our wizard will guide you through the validator creation process.
      </Paragraph>
      <SubTitle>How would you like to start?</SubTitle>
      <ButtonsWrapper>
        <CustomButton
          title={NETWORKS.pyrmont.title}
          image={NETWORKS.pyrmont.image}
          isDisabled={false}
          onClick={() => onClick({ ...props }, NETWORKS.pyrmont.label)}
        />
        <CustomButton
          title={NETWORKS.mainnet.title}
          image={NETWORKS.mainnet.image}
          isDisabled={false}
          onClick={() => onClick({ ...props }, NETWORKS.mainnet.label)}
        />
      </ButtonsWrapper>
    </Wrapper>
  );
};

type Props = {
  page: number;
  setPage: (page: number) => void;
  step: number;
  setStep: (page: number) => void;
  setNetwork: (network: string) => void;
  profile: Record<string, any>;
};

const mapStateToProps = (state) => ({
  profile: getUserData(state),
});

const mapDispatchToProps = (dispatch) => ({
  setNetwork: (network) => dispatch(setNetworkType(network)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Validators);
