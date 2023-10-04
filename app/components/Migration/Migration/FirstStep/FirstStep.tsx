import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import { validateAddressInput } from '~app/utils/service';
import Checkbox from '~app/common/components/Checkbox/Checkbox';
import Buttons from '~app/components/Migration/Buttons/Buttons';
import useMigrationData from '~app/components/Migration/useMigrationData';
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

const ErrorMessage = styled.p`
  color: red;
`;

const FirstStep = ({nextStep, cancelHandler}: {nextStep: () => void, cancelHandler: () => void}) => {
  const {saveAddress, removeAddress, ownerAddress} = useMigrationData();
  const [address, setAddress] = useState(ownerAddress);
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState({shouldDisplay: false, errorMessage: ''});
  const disableBtnCondition = !address || !checked || error.shouldDisplay;

  useEffect(() => {
    if (address && !error.shouldDisplay) {
      saveAddress(address);
    }
  }, [address]);

  const errorHandler = (e: {shouldDisplay: boolean, errorMessage: string}) => {
    setError(e);
  };

  const onInputChangeHandler = (e: any) => {
    const {value} = e.target;
    setAddress(value);
    validateAddressInput(value, errorHandler);
  };

  const onCancelHandler = () => {
    removeAddress();
    cancelHandler();
  };

  return (
    <div>
      <Title>Validator Owner Address</Title>
      <Layout>
        <Text>Please provide the Ethereum address that you intend to register the validators with.</Text>
        <Text> This wallet will be used to log-in to your SSV account and manage your validators on the SSV network.</Text>
        <InputWrapper>
          <InputLabel>Ethereum Address</InputLabel>
          <Input value={address} onChange={onInputChangeHandler} />
          <ErrorMessage>{error.shouldDisplay && error.errorMessage}</ErrorMessage>
        </InputWrapper>
        <Checkbox checkboxStyle={{marginRight: 8}} checked={checked} onClick={setChecked}>
          I confirm I have access to this Ethereum wallet and it’s under my possession
        </Checkbox>
      </Layout>
      <Buttons acceptAction={nextStep} disabled={disableBtnCondition} cancelAction={onCancelHandler} acceptButtonLabel={'Migrate'} />
    </div>
  );
};

export default FirstStep;
