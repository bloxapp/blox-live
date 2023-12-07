import React, { useState} from 'react';
import {useDispatch} from 'react-redux';
import Web3 from 'web3';
import styled from 'styled-components';
import Checkbox from '../../../common/components/Checkbox/Checkbox';
import FooterWithButtons from '../FooterWithButtons/FooterWithButtons';
import {AdditionalText, Layout, Title} from '../styles';
import {changeOwnerAddress} from '../actions';

export const validateAddressInput = (value: string, isEmptyValid: boolean = false): string => {
  const web3 = new Web3();
  const regx = /^[A-Za-z0-9]+$/;
  if (value.length === 0 && isEmptyValid) {
    return '';
  }
  if (value.length === 0) {
    return 'Please enter an operator address.';
  }
  if ((value.length !== 42 && value.startsWith('0x')) || (value.length !== 40 && !value.startsWith('0x')) || (!web3.utils.isAddress(value))) {
    return 'Operator address must be a valid address format.';
  }
  if (!regx.test(value)) {
    return 'Operator address should contain only alphanumeric characters.';
  }
  return '';
};

const Text = styled(AdditionalText)`
  margin: 0;
`;

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin: 30px 0;
`;

const InputLabel = styled.div`
  color: #878B92;
  font-family: Avenir, sans-serif;
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

const Phase1Step1 = ({ nextStep, cancelHandler }: { nextStep: () => void; cancelHandler: () => void; }) => {
  const [address, setAddress] = useState('');
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState('');

  const dispatch = useDispatch();

  const removeAddress = () => {
    dispatch(changeOwnerAddress(''));
  };

  const disableBtnCondition = !address || !checked || error !== '';

  const onInputChangeHandler = (e: any) => {
    const {value} = e.target;
    setAddress(value);
    const errorMessage = validateAddressInput(value);
    if (errorMessage) {
      setError(errorMessage);
    } else {
      dispatch(changeOwnerAddress(value));
    }
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
          {!!error && <ErrorMessage>{error}</ErrorMessage>}
        </InputWrapper>
        <Checkbox checkboxStyle={{marginRight: 8}} checked={checked} onClick={setChecked}>
          I confirm I have access to this Ethereum wallet and it’s under my possession
        </Checkbox>
      </Layout>
      <FooterWithButtons acceptAction={nextStep} disabled={disableBtnCondition} cancelAction={onCancelHandler} acceptButtonLabel={'Migrate'} />
    </div>
  );
};

export default Phase1Step1;
