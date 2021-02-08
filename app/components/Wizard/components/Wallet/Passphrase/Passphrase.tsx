import React, { useState } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { Regular, Backup } from './components';
import { writeToTxtFile } from './service';

import * as actionsFromPassword from '../../../../PasswordHandler/actions';
import passwordSaga from '../../../../PasswordHandler/saga';

import * as actionsFromKeyvault from '../../../../KeyVaultManagement/actions';
import { getMnemonic, getIsLoading } from '../../../../KeyVaultManagement/selectors';
import keyvaultSaga from '../../../../KeyVaultManagement/saga';

import { useInjectSaga } from 'utils/injectSaga';
import useCreatePassword from 'common/hooks/useCreatePassword';
import BackButton from '../../common/BackButton';

const keyvaultKey = 'keyvaultManagement';
const passwordKey = 'password';

const Passphrase = (props: Props) => {
  const { page, setPage, mnemonic, isLoading, keyvaultActions, passwordActions } = props;
  const { keyvaultLoadMnemonic, keyvaultSaveMnemonic } = keyvaultActions;
  const { replacePassword } = passwordActions;

  const { password, setPassword, confirmPassword, setConfirmPassword, showPasswordError,
          showConfirmPasswordError, onPasswordBlur, onConfirmPasswordBlur
        } = useCreatePassword();

  const [showBackup, toggleBackupDisplay] = useState(false);
  const [duplicatedMnemonic, setDuplicatedMnemonic] = useState('');
  const [showDuplicatedMnemonicError, setDuplicatedMnemonicErrorDisplay] = useState(false);
  const isButtonDisabled = !mnemonic;

  useInjectSaga({key: keyvaultKey, saga: keyvaultSaga, mode: ''});
  useInjectSaga({key: passwordKey, saga: passwordSaga, mode: ''});

  const onPassphraseClick = () => {
    if (mnemonic || isLoading) { return; }
    keyvaultLoadMnemonic();
  };

  const onSaveAndConfirmClick = async () => {
    const canGenerate = canGenerateMnemonic();
    if (canGenerate) {
      await replacePassword(password);
      await keyvaultSaveMnemonic(duplicatedMnemonic);
      await !isButtonDisabled && setPage(page + 1);
    }
  };

  const onDownloadClick = () => {
    if (!mnemonic) { return null; }
    writeToTxtFile('Blox Secret Backup Passphrase', mnemonic);
  };

  const showBackupScreen = () => mnemonic && toggleBackupDisplay(true);

  const canGenerateMnemonic = () => {
    const mnemonicsAreEqual = mnemonic === duplicatedMnemonic;
    const passwordsAreEqual = password === confirmPassword;
    const passwordshaveMoreThan8Char = password.length >= 8 && confirmPassword.length >= 8;
    return mnemonicsAreEqual && passwordsAreEqual && passwordshaveMoreThan8Char;
  };

  const onDuplicateMnemonicBlur = () => {
    if (mnemonic !== duplicatedMnemonic) {
      setDuplicatedMnemonicErrorDisplay(true);
      return;
    }
    setDuplicatedMnemonicErrorDisplay(false);
  };

  const onBackButtonClick = () => {
    showBackup ? toggleBackupDisplay(false) : setPage(page - 1);
  };
  return (
    <div>
      <BackButton onClick={onBackButtonClick} />
      {showBackup ? (
        <Backup onNextButtonClick={onSaveAndConfirmClick}
          password={password} setPassword={setPassword} confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword} isSaveAndConfirmEnabled={canGenerateMnemonic}
          duplicatedMnemonic={duplicatedMnemonic} setDuplicatedMnemonic={setDuplicatedMnemonic}
          showDuplicatedMnemonicError={showDuplicatedMnemonicError} onDuplicateMnemonicBlur={onDuplicateMnemonicBlur}
          isLoading={isLoading} showPasswordError={showPasswordError} showConfirmPasswordError={showConfirmPasswordError}
          onPasswordBlur={onPasswordBlur} onConfirmPasswordBlur={onConfirmPasswordBlur}
        />
      ) : (
        <Regular mnemonic={mnemonic} isLoading={isLoading} onPassphraseClick={onPassphraseClick}
          onNextButtonClick={showBackupScreen} onDownloadClick={onDownloadClick}
        />
      )}
    </div>
  );
};

type Page = number;

type Props = {
  page: Page;
  setPage: (page: Page) => void;
  mnemonic: string;
  isLoading: boolean;
  keyvaultActions: Record<string, any>;
  passwordActions: Record<string, any>;
};

const mapStateToProps = (state) => ({
  mnemonic: getMnemonic(state),
  isLoading: getIsLoading(state),
});

const mapDispatchToProps = (dispatch) => ({
  keyvaultActions: bindActionCreators(actionsFromKeyvault, dispatch),
  passwordActions: bindActionCreators(actionsFromPassword, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(Passphrase);
