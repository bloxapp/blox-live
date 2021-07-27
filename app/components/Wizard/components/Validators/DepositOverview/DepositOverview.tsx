import { connect } from 'react-redux';
import styled from 'styled-components';
import {bindActionCreators} from 'redux';
import React from 'react';
import config from '~app/backend/common/config';
import BloxApi from '~app/backend/common/communication-manager/blox-api';
import { Title, Paragraph, BackButton, BigButton } from '~app/components/Wizard/components/common';
import { getNetwork, getDecryptedKeyStores } from '~app/components/Wizard/selectors';
import { MainNetKeyStoreText } from '~app/components/Wizard/components/Validators/StakingDeposit/components';
import * as actionsFromWizard from '../../../actions';
import theme from '../../../../../theme';

const Wrapper = styled.div`
  width:650px;
`;

const SmallText = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: ${theme.gray600};
  margin-top: 12px;
`;

const ButtonsWrapper = styled.div`
  width:270px;
  margin-top:12px;
  // align-items: center;
  text-align: center;
`;

const LaterBtn = styled.span`
    // width: 100%;
    font-size: 16px;
    font-weight: 900;
    cursor:pointer;
    display: inline-block;
    margin-top:10px;
    color: ${({theme, color}) => theme[color] || theme.primary900};
`;

const bloxApi = new BloxApi();
bloxApi.init();

const DepositOverview = (props: ValidatorsSummaryProps) => {
  const { setPage, setStep, decryptedKeyStores } = props;
  // const { } = wizardActions;
  return (
    <Wrapper>
      <BackButton onClick={() => {
        console.log(props);
        setStep(config.WIZARD_STEPS.VALIDATOR_SETUP);
        setPage(config.WIZARD_PAGES.VALIDATOR.VALIDATOR_SUMMARY);
      }} />
      <Title>Mainnet Staking Deposit</Title>
      <Paragraph style={{ marginBottom: 5 }}>
        To start staking, first, you'll need to make a deposit:
      </Paragraph>
      <MainNetKeyStoreText amountOfValidators={decryptedKeyStores.length} publicKey={''} onCopy={() => { console.log('s'); }} />
      {decryptedKeyStores.length > 1 && <Paragraph style={{fontWeight: 'bold', color: '#2536b8', marginTop: 10 }}>
        Total: {decryptedKeyStores.length * 32} ETH + gas fees
      </Paragraph>}

      <SmallText>
        You will be transferred to
        a secured Blox webpage
      </SmallText>

      <ButtonsWrapper>
        <BigButton onClick={() => { alert('bla'); }}>Continue to Web Deposit</BigButton>
        <LaterBtn onClick={() => { alert('bla'); }}>I&apos;ll Deposit Later</LaterBtn>
      </ButtonsWrapper>
    </Wrapper>
  );
};

type ValidatorsSummaryProps = {
  network: string;
  wizardActions: Record<string, any>;
  setPage: (page: number) => void;
  setStep: (page: number) => void;
};

const mapStateToProps = (state: any) => ({
  network: getNetwork(state),
  decryptedKeyStores: getDecryptedKeyStores(state),
});

const mapDispatchToProps = (dispatch) => ({
  wizardActions: bindActionCreators(actionsFromWizard, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(DepositOverview);
