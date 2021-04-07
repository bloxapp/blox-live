import React, { useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import config from '~app/backend/common/config';
import { useInjectSaga } from '~app/utils/injectSaga';
import passwordSaga from '~app/components/PasswordHandler/saga';
import keyVaultSaga from '~app/components/KeyVaultManagement/saga';
import useCreatePassword from '~app/common/hooks/useCreatePassword';
import { getIsLoading } from '~app/components/KeyVaultManagement/selectors';
import * as actionsFromPassword from '~app/components/PasswordHandler/actions';
import * as actionsFromKeyvault from '~app/components/KeyVaultManagement/actions';
import BackButton from '~app/components/Wizard/components/common/BackButton/BackButton';
import Backup from '~app/components/Wizard/components/Wallet/Passphrase/components/Backup';

const keyVaultKey = 'keyvaultManagement';
const passwordKey = 'password';

const ImportPassphrase = (props: Props) => {
  const { setPage, isLoading, keyVaultActions, passwordActions } = props;
  const { keyvaultSaveMnemonic } = keyVaultActions;
  const { replacePassword } = passwordActions;

  const {
    password, setPassword, confirmPassword, setConfirmPassword, showPasswordError,
    showConfirmPasswordError, onPasswordBlur, onConfirmPasswordBlur
  } = useCreatePassword();

  const [userMnemonic, setUserMnemonic] = useState('');
  const [userMnemonicError, setUserMnemonicError] = useState(false);
  const isButtonDisabled = !userMnemonic;

  useInjectSaga({key: keyVaultKey, saga: keyVaultSaga, mode: ''});
  useInjectSaga({key: passwordKey, saga: passwordSaga, mode: ''});

  const allInputsAreValid = () => {
    const passwordsAreEqual = password === confirmPassword;
    const passwordsHaveMoreThan8Char = password.length >= 8 && confirmPassword.length >= 8;
    return passwordsAreEqual && passwordsHaveMoreThan8Char;
  };

  const onSaveAndConfirmClick = async () => {
    if (allInputsAreValid()) {
      await replacePassword(password);
      // Generate seed and save
      await keyvaultSaveMnemonic(userMnemonic);
      await (!isButtonDisabled && setPage(config.WIZARD_PAGES.WALLET.IMPORT_VALIDATORS));
    }
  };

  const onUserMnemonicBlur = () => {
    const defaultMnemonicLengthPhrase = 24;
    if (!userMnemonic || userMnemonic.length === 0) {
      return setUserMnemonicError(true);
    }
    if (userMnemonic.split(' ').length !== defaultMnemonicLengthPhrase) {
      return setUserMnemonicError(true);
    }
    setUserMnemonicError(false);
  };

  const onBackButtonClick = () => {
    setPage(config.WIZARD_PAGES.WALLET.IMPORT_OR_GENERATE_SEED);
  };

  return (
    <div>
      <BackButton onClick={onBackButtonClick} />
      <Backup
        isImport
        password={password}
        isLoading={isLoading}
        setPassword={setPassword}
        onPasswordBlur={onPasswordBlur}
        confirmPassword={confirmPassword}
        duplicatedMnemonic={userMnemonic}
        showPasswordError={showPasswordError}
        setDuplicatedMnemonic={setUserMnemonic}
        setConfirmPassword={setConfirmPassword}
        onNextButtonClick={onSaveAndConfirmClick}
        isSaveAndConfirmEnabled={allInputsAreValid}
        onDuplicateMnemonicBlur={onUserMnemonicBlur}
        onConfirmPasswordBlur={onConfirmPasswordBlur}
        showDuplicatedMnemonicError={!!userMnemonicError}
        showConfirmPasswordError={showConfirmPasswordError}
      />
    </div>
  );
};

type Page = number;

type Props = {
  page: Page;
  setPage: (page: Page) => void;
  isLoading: boolean;
  keyVaultActions: Record<string, any>;
  passwordActions: Record<string, any>;
};

const mapStateToProps = (state) => ({
  isLoading: getIsLoading(state),
});

const mapDispatchToProps = (dispatch) => ({
  keyVaultActions: bindActionCreators(actionsFromKeyvault, dispatch),
  passwordActions: bindActionCreators(actionsFromPassword, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(ImportPassphrase);
