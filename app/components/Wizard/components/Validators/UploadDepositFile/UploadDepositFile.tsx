import { connect } from 'react-redux';
import {bindActionCreators} from 'redux';
import React, { useEffect, useState } from 'react';
import { getNetwork, getDecryptedKeyStores } from '~app/components/Wizard/selectors';
import { Title, Paragraph, BackButton } from '~app/components/Wizard/components/common';
import * as actionsFromWizard from '../../../actions';
import styled from 'styled-components';
import config from '../../../../../backend/common/config';

const Wrapper = styled.div`
  width:650px;
`;

const UploadDepoistFile = (props: SlashingWarningProps) => {
  const { setPage, setStep } = props;

  return (
    <Wrapper>
      <BackButton onClick={() => {
        setStep(config.WIZARD_STEPS.VALIDATOR_SETUP);
        setPage(config.WIZARD_PAGES.VALIDATOR.VALIDATOR_SUMMARY);
      }} />
      <Title>Mainnet Staking Deposit</Title>
      <Paragraph style={{ marginBottom: 5 }}>
        To start staking, first, you'll need to make a deposit:
      </Paragraph>
    </Wrapper>
  );
};

type SlashingWarningProps = {
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

export default connect(mapStateToProps, mapDispatchToProps)(UploadDepoistFile);
