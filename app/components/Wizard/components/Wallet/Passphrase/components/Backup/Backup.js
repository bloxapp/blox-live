import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Button, Spinner, PasswordInput } from 'common/components';
import { Title, Paragraph, Warning, TextArea } from '../../../../common';

const Wrapper = styled.div`
  width: 100%;
  max-width:560px;
  height: 100%;
  display: flex;
  flex-direction: column;
  font-family: Avenir, serif;
  font-size: 16px;
  font-weight: 500;
`;

const PasswordInputsWrapper = styled.div`
  width: 454px;
  margin-top:41px;
  display: flex;
  justify-content:space-between;
  font-size: 16px;
  font-weight: 500;
`;

const ButtonWrapper = styled.div`
  margin-top:41px;
  margin-bottom:41px;
`;

const Backup = (props) => {
  const { isImport, onNextButtonClick, password, setPassword, confirmPassword,
          setConfirmPassword, isSaveAndConfirmEnabled, duplicatedMnemonic, setDuplicatedMnemonic,
          isLoading, showDuplicatedMnemonicError, onDuplicateMnemonicBlur,
          showPasswordError, onPasswordBlur, showConfirmPasswordError, onConfirmPasswordBlur
        } = props;

  const confirmButtonStyle = { width: 190, height: 40 };

  const handleChange = event => {
    const value = event.replace(/[\r\n\v]+/g, '');
    setDuplicatedMnemonic(value);
  };

  return (
    <Wrapper>
      <Title>{isImport ? 'Import Seed' : 'Backup Recovery Passphrase'}</Title>

      <Paragraph>{
        isImport ?
          'Input the Seed provided by your Eth2 launchpad or current staking provider. Set a password to start staking with Blox.' :
          'Confirm your Passphrase and set a password for critical actions such as creating/removing a validator.'
      }
      </Paragraph>

      {isImport && <Warning style={{ marginBottom: '34px'}} text={'Please be sure to store your 24 passphrase seed safely and do not share it with anyone.'} />}

      <TextArea
        marginTop={0}
        value={duplicatedMnemonic}
        onChange={(value) => { handleChange(value); onDuplicateMnemonicBlur(value); }}
        onBlur={(event) => { handleChange(event.target.value); onDuplicateMnemonicBlur(event.target.value); }}
        onPaste={(event) => { handleChange(event.target.value); onDuplicateMnemonicBlur(event.target.value); }}
        autoFocus
        placeholder={'Separate each word with a space'}
        error={showDuplicatedMnemonicError ? 'Passphrase not correct' : ''}
      />

      <PasswordInputsWrapper>
        <PasswordInput name={'password'} title={'Password (min 8 chars)'}
          onChange={setPassword} value={password} onBlur={onPasswordBlur}
          error={showPasswordError ? 'The password is too short' : ''}
        />
        <PasswordInput name={'confirmPassword'} title={'Confirm Password'}
          onChange={setConfirmPassword} value={confirmPassword} onBlur={onConfirmPasswordBlur}
          error={showConfirmPasswordError ? 'Passwords don\'t match' : ''}
        />
      </PasswordInputsWrapper>

      <ButtonWrapper>
        <Button
          style={confirmButtonStyle}
          isDisabled={!isSaveAndConfirmEnabled()}
          onClick={onNextButtonClick}
        >
          Save &amp; Confirm
        </Button>
        {isLoading && <Spinner />}
      </ButtonWrapper>

      { !isImport && <Warning text={'The only way to restore your account or to reset your password is using your passphrase.'} />}
    </Wrapper>
  );
};

Backup.propTypes = {
  isImport: PropTypes.bool,
  onNextButtonClick: PropTypes.func,
  password: PropTypes.string,
  setPassword: PropTypes.func,
  confirmPassword: PropTypes.string,
  setConfirmPassword: PropTypes.func,
  isSaveAndConfirmEnabled: PropTypes.func,
  duplicatedMnemonic: PropTypes.string,
  setDuplicatedMnemonic: PropTypes.func,
  isLoading: PropTypes.bool,
  showDuplicatedMnemonicError: PropTypes.bool,
  showPasswordError: PropTypes.bool,
  showConfirmPasswordError: PropTypes.bool,
  onDuplicateMnemonicBlur: PropTypes.func,
  onPasswordBlur: PropTypes.func,
  onConfirmPasswordBlur: PropTypes.func,
};

export default Backup;
