import React from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import config from '~app/backend/common/config';
import { selectedKeystoreMode } from '~app/common/service';
import { setNetworkType } from '~app/components/Wizard/actions';
import { getAccounts } from '~app/components/Accounts/selectors';
import { NETWORKS } from '~app/components/Wizard/components/Validators/constants';
import { Title, SubTitle, Paragraph } from '~app/components/Wizard/components/common';
import { getUserData } from '~app/components/Login/components/CallbackPage/selectors';
import BackButton from '~app/components/Wizard/components/common/BackButton/BackButton';
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

const onClick = ({ setPage, setNetwork }: ValidatorsProps, network) => {
  setNetwork(network);
  if (selectedKeystoreMode()) {
    setPage(config.WIZARD_PAGES.VALIDATOR.UPLOAD_KEYSTORE_FILE);
  } else {
    setPage(config.WIZARD_PAGES.VALIDATOR.CREATE_VALIDATOR);
  }
};

const Validators = (props: ValidatorsProps) => {
  const { setPage, setStep, accounts } = props;
  return (
    <Wrapper>
      {accounts.length === 0 ? (
        <BackButton onClick={() => {
          setStep(config.WIZARD_STEPS.VALIDATOR_SETUP);
          setPage(config.WIZARD_PAGES.WALLET.SEED_OR_KEYSTORE);
        }} />
      ) : ''}
      <Title>Select your Staking network</Title>
      <Paragraph>
        Blox let’s you stake on the Eth2 Mainnet or run a Testnet validator to try
        our <br />
        staking services. Please select your staking network and our wizard will guide you through the validator creation process.
      </Paragraph>
      <SubTitle>How would you like to start?</SubTitle>
      <ButtonsWrapper>
        <CustomButton
          title={NETWORKS.prater.title}
          image={NETWORKS.prater.image}
          isDisabled={false}
          onClick={() => onClick({ ...props }, NETWORKS.prater.label)}
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

type ValidatorsProps = {
  page: number;
  setPage: (page: number) => void;
  step: number;
  setStep: (page: number) => void;
  setNetwork: (network: string) => void;
  profile: Record<string, any>;
  accounts: Array<any>;
};

const mapStateToProps = (state) => ({
  profile: getUserData(state),
  accounts: getAccounts(state),
});

const mapDispatchToProps = (dispatch) => ({
  setNetwork: (network) => dispatch(setNetworkType(network)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Validators);
