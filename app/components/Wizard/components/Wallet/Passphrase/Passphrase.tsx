import React, { useState } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import config from '~app/backend/common/config';
import { useInjectSaga } from '~app/utils/injectSaga';
import passwordSaga from '~app/components/PasswordHandler/saga';
import keyvaultSaga from '~app/components/KeyVaultManagement/saga';
import useCreatePassword from '~app/common/hooks/useCreatePassword';
import BackButton from '~app/components/Wizard/components/common/BackButton';
import * as actionsFromPassword from '~app/components/PasswordHandler/actions';
import * as actionsFromKeyvault from '~app/components/KeyVaultManagement/actions';
import { getMnemonic, getIsLoading } from '~app/components/KeyVaultManagement/selectors';
import { writeToTxtFile } from '~app/components/Wizard/components/Wallet/Passphrase/service';
import { Regular, Backup } from '~app/components/Wizard/components/Wallet/Passphrase/components';

const keyvaultKey = 'keyvaultManagement';
const passwordKey = 'password';

const Passphrase = (props: Props) => {
  const { setPage, mnemonic, isLoading, keyvaultActions, passwordActions } = props;
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
      !isButtonDisabled && setPage(config.WIZARD_PAGES.VALIDATOR.SELECT_NETWORK);
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
    showBackup ? toggleBackupDisplay(false) : setPage(config.WIZARD_PAGES.WALLET.IMPORT_OR_GENERATE_SEED);
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
