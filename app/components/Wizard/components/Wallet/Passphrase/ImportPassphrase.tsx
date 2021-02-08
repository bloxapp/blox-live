import React, { useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Backup from './components/Backup';
import passwordSaga from '../../../../PasswordHandler/saga';
import BackButton from '../../common/BackButton/BackButton';
import keyVaultSaga from '../../../../KeyVaultManagement/saga';
import { useInjectSaga } from '../../../../../utils/injectSaga';
import { getIsLoading } from '../../../../KeyVaultManagement/selectors';
import * as actionsFromPassword from '../../../../PasswordHandler/actions';
import * as actionsFromKeyvault from '../../../../KeyVaultManagement/actions';
import useCreatePassword from '../../../../../common/hooks/useCreatePassword';

const keyVaultKey = 'keyvaultManagement';
const passwordKey = 'password';

const ImportPassphrase = (props: Props) => {
  const { page, setPage, isLoading, keyVaultActions, passwordActions } = props;
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
      await (!isButtonDisabled && setPage(page + 1));
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
    setPage(4);
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
