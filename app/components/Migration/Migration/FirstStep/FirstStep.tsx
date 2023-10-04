import React, {useState} from 'react';
import styled from 'styled-components';
import Checkbox from '~app/common/components/Checkbox/Checkbox';
import Buttons from '~app/components/Migration/Buttons/Buttons';
import {AdditionalText, Layout, Title} from '~app/components/Migration/styles';

const Text = styled(AdditionalText)`
  margin: 0;
`;

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin: 30px 0px 30px 0px;
`;

const InputLabel = styled.div`
  color: #878B92;
  font-family: Avenir;
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  line-height: 24px;
`;

const Input = styled.input`
  display: flex;
  width: 780px;
  height: 36px;
  padding: 8px 370px 8px 20px;
  align-items: center;
  border-radius: 4px;
  border: 1px solid #E5EAF1 !important;
  background: #FFF;
`;

const FirstStep = ({nextStep}: {nextStep: () => void}) => {
  const [checked, setChecked] = useState(false);

  return (
    <div>
      <Title>Validator Owner Address</Title>
      <Layout>
        <Text>Please provide the Ethereum address that you intend to register the validators with.</Text>
        <Text> This wallet will be used to log-in to your SSV account and manage your validators on the SSV network.</Text>
        <InputWrapper>
          <InputLabel>Ethereum Address</InputLabel>
          <Input />
        </InputWrapper>
        <Checkbox checkboxStyle={{marginRight: 8}} checked={checked} onClick={setChecked}>
          I confirm I have access to this Ethereum wallet and it’s under my possession
        </Checkbox>
      </Layout>
      <Buttons acceptAction={nextStep} disabled={!checked} cancelAction={null} acceptButtonLabel={'Migrate'} />
    </div>
  );
};

export default FirstStep;
