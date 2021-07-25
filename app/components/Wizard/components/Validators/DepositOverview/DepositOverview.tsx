import { connect } from 'react-redux';
import styled from 'styled-components';
import {bindActionCreators} from 'redux';
import React from 'react';
import config from '~app/backend/common/config';
import BloxApi from '~app/backend/common/communication-manager/blox-api';
import { getNetwork, getDecryptedKeyStores } from '~app/components/Wizard/selectors';
import { Title, Paragraph, BackButton } from '~app/components/Wizard/components/common';
import * as actionsFromWizard from '../../../actions';

const Wrapper = styled.div`
  width:650px;
`;

const ButtonWrapper = styled.div`
  margin-top:41px;
  margin-bottom:41px;
`;

const Button = styled.button`
  width: 238px;
  height: 40px;
  font-size: 14px;
  font-weight: 900;
  display:flex;
  align-items:center;
  justify-content:center;
  background-color: ${({theme}) => theme.primary900};
  border-radius: 6px;
  color:${({theme}) => theme.gray50};
  border:0;
  cursor: pointer ;
`;

const bloxApi = new BloxApi();
bloxApi.init();

const DepositOverview = (props: ValidatorsSummaryProps) => {
  const { setPage, setStep } = props;

const onNextButtonClick = () => {
  alert('need to be implement');
};
  return (
    <Wrapper>
      <BackButton onClick={() => {
        setStep(config.WIZARD_STEPS.VALIDATOR_SETUP);
        setPage(config.WIZARD_PAGES.VALIDATOR.UPLOAD_KEYSTORE_FILE);
      }} />
      <Title>Mainnet Staking Deposit</Title>
      <Paragraph style={{ marginBottom: 5 }}>
        To start staking, first, you'll need to make a deposit:
      </Paragraph>
      <br />
      <ButtonWrapper>
        <Button
          onClick={() => { onNextButtonClick(); }}>
          Continue to Web Deposit
        </Button>
      </ButtonWrapper>
    </Wrapper>
  );
};

type ValidatorsSummaryProps = {
  page: number;
  setPage: (page: number) => void;
  step: number;
  setStep: (page: number) => void;
  setPageData: (data: any) => void;
  network: string;
  wizardActions: Record<string, any>;
  decryptedKeyStores: Array<any>,
};

const mapStateToProps = (state: any) => ({
  network: getNetwork(state),
  decryptedKeyStores: getDecryptedKeyStores(state),
});

const mapDispatchToProps = (dispatch) => ({
  wizardActions: bindActionCreators(actionsFromWizard, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(DepositOverview);
