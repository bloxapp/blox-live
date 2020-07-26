import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { InfoWithTooltip } from '../../../../../common/components';
import { Title, SubTitle, Paragraph, Link, Button } from '../../common';
import { loadDepositData } from '../../../actions';
import * as selectors from '../../../selectors';
import { ButtonInnerWrapper, MetaMaskButton } from './components';
import { getTxHash } from '../../../../MetaMask/selectors';

import ethImage from 'components/Wizard/components/Validators/StakingDeposit/assets/eth-logo.svg';

const Wrapper = styled.div``;

const ButtonsWrapper = styled.div`
  width: 33vw;
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const ButtonText = styled.div`
  font-size: 16px;
  font-weight: 500;
  line-height: 1.75;
`;

const StatusContainer = styled.div`
  width: 560px;
  height: 44px;
  padding: 0px 16px;
  margin-top: 66px;
  display: flex;
  align-items: center;
  border-radius: 8px;
  color: ${({ theme }) => theme.primary900};
  background-color: ${({ theme }) => theme.primary100};
`;

const StatusContainerSuccess = styled(StatusContainer)`
  background-color: ${({ theme }) => theme.accent2300};
`;

let toolTipText =
  'GoETH are test tokens needed in order to participate in the Goerli Test Network.';
toolTipText +=
  'You need at least 32 GoETH test tokens in order to stake on TestNet. GoETH have no real value!';

const StakingDeposit = (props: Props) => {
  const {
    setPage,
    page,
    depositData,
    isLoading,
    callLoadDepositData,
    metaMaskTxHash,
  } = props;

  useEffect(() => {
    if (!depositData && !isLoading) {
      callLoadDepositData();
    }
    if (metaMaskTxHash) {
      setTimeout(() => setPage(page + 1), 2000);
    }
  }, [isLoading, depositData, metaMaskTxHash]);

  return (
    <Wrapper>
      <Title>TestNet Staking Deposit</Title>
      <Paragraph>
        To start staking on our Testnet, you are required to stake 32 GoEth
        <InfoWithTooltip title={toolTipText} placement="bottom" /> into the
        <br />
        validator deposit contract. The Blox test network uses the Goerli
        network to <br />
        simulate validator deposits on the proof-of-work enabled Beacon-chain.
      </Paragraph>
      <SubTitle>How would you like to stake?</SubTitle>
      <ButtonsWrapper>
        <MetaMaskButton />
        <Button width="260px" height="100px" isDisabled>
          <ButtonInnerWrapper>
            <img src={ethImage} />
            <ButtonText>Other ETH Wallets</ButtonText>
          </ButtonInnerWrapper>
        </Button>
      </ButtonsWrapper>
      <Link href={'/'}>Need help?</Link>
      {metaMaskTxHash ? (
        <StatusContainerSuccess>
          Status: Validator Deposit Received!
        </StatusContainerSuccess>
      ) : (
        <StatusContainer>Status: Waiting for deposit</StatusContainer>
      )}
    </Wrapper>
  );
};

const mapStateToProps = (state: State) => ({
  isLoading: selectors.getIsLoading(state),
  depositData: selectors.getDepositData(state),
  publicKey: selectors.getPublicKey(state),
  metaMaskTxHash: getTxHash(state.metaMask),
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  callLoadDepositData: () => dispatch(loadDepositData()),
});

type Props = {
  page: number;
  setPage: (page: number) => void;
  step: number;
  setStep: (page: number) => void;
  isLoading: boolean;
  depositData: Record<string, any> | null;
  callLoadDepositData: () => void;
  publicKey: string;
  metaMaskTxHash: string;
};

type State = Record<string, any>;
type Dispatch = (arg0: { type: string }) => any;

export default connect(mapStateToProps, mapDispatchToProps)(StakingDeposit);
