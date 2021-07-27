import { connect } from 'react-redux';
import styled from 'styled-components';
import React, { useEffect, useState } from 'react';
import { getNetwork, getDecryptedKeyStores } from '~app/components/Wizard/selectors';
import { Title, Paragraph, BackButton } from '~app/components/Wizard/components/common';
import config from '../../../../../backend/common/config';
import {Checkbox} from '../../../../../common/components';

const Wrapper = styled.div`
  width:650px;
`;

const ButtonWrapper = styled.div`
  margin-top:41px;
  margin-bottom:41px;
`;

const Button = styled.button<{ isDisabled }>`
  width: 320px;
  height: 40px;
  font-size: 14px;
  font-weight: 900;
  display:flex;
  align-items:center;
  justify-content:center;
  background-color: ${({theme, isDisabled}) => isDisabled ? theme.gray400 : theme.primary900};
  border-radius: 6px;
  color:${({theme}) => theme.gray50};
  border:0;
  cursor:${({isDisabled}) => isDisabled ? 'default' : 'pointer'};
`;

const SlashingWarning = (props: SlashingWarningProps) => {
  const { setPage, setStep } = props;
  const [isChecked, setIsChecked] = useState(false);
  const [isContinueButtonDisabled, setContinueButtonDisabled] = useState(true);
  const checkboxStyle = { marginRight: 5 };
  const checkboxLabelStyle = { fontSize: 12 };

  useEffect(() => {
    setContinueButtonDisabled(!isChecked);
  }, [isChecked]);

  const onNextButtonClick = () => {
    alert('need to implememnt');
  };

  return (
    <Wrapper>
      <BackButton onClick={() => {
        setStep(config.WIZARD_STEPS.VALIDATOR_SETUP);
        setPage(config.WIZARD_PAGES.VALIDATOR.VALIDATOR_SUMMARY);
      }} />
      <Title>Slashing Warning</Title>
      <Paragraph style={{ marginBottom: 5 }}>
        Your validators are currently active on the beacon chain:
      </Paragraph>
      <br />
      <Paragraph style={{ marginBottom: 5 }}>
        Running validators simultaneously in multiple setups will cause slashing to  <br />
        your validator
      </Paragraph>
      <br />
      <Paragraph style={{ marginBottom: 5 }}>
        To avoid slashing, <strong>shut down your existing validators setup</strong> before running <br />
        your validators with BloxStaking.
      </Paragraph>
      <br />
      <Checkbox
        checked={isChecked}
        onClick={() => { setIsChecked(!isChecked); }}
        checkboxStyle={checkboxStyle}
        labelStyle={checkboxLabelStyle}
      >
        I'm aware that before running my validators, to avoid slashing risks, my validators needs to be offline.
      </Checkbox>
      <ButtonWrapper>
        <Button
          isDisabled={isContinueButtonDisabled}
          onClick={() => { !isContinueButtonDisabled && onNextButtonClick(); }}>
          Confirm & Run Validator with BloxStaking
        </Button>
      </ButtonWrapper>
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
  decryptedKeyStores: Array<any>,
};

const mapStateToProps = (state: any) => ({
  network: getNetwork(state),
  decryptedKeyStores: getDecryptedKeyStores(state),
});

export default connect(mapStateToProps, null)(SlashingWarning);
