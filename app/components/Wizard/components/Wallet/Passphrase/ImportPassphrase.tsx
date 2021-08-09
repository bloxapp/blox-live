import React, { useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import config from '~app/backend/common/config';
import { useInjectSaga } from '~app/utils/injectSaga';
import passwordSaga from '~app/components/PasswordHandler/saga';
import keyVaultSaga from '~app/components/KeyVaultManagement/saga';
import { getIsLoading } from '~app/components/KeyVaultManagement/selectors';
import * as actionsFromKeyvault from '~app/components/KeyVaultManagement/actions';
import usePasswordHandler from '~app/components/PasswordHandler/usePasswordHandler';
import BackButton from '~app/components/Wizard/components/common/BackButton/BackButton';
import Backup from '~app/components/Wizard/components/Wallet/Passphrase/components/Backup';

const keyVaultKey = 'keyvaultManagement';
const passwordKey = 'password';

const ImportPassphrase = (props: ImportPassphraseProps) => {
  const { setPage, isLoading, keyVaultActions } = props;
  const { keyvaultSaveMnemonic } = keyVaultActions;
  const [userMnemonic, setUserMnemonic] = useState('');
  const [userMnemonicError, setUserMnemonicError] = useState(false);
  const isButtonDisabled = !userMnemonic;
  const { checkIfPasswordIsNeeded } = usePasswordHandler();

  useInjectSaga({key: keyVaultKey, saga: keyVaultSaga, mode: ''});
  useInjectSaga({key: passwordKey, saga: passwordSaga, mode: ''});

  const onSaveAndConfirmClick = async () => {
    if (!userMnemonicError) {
      checkIfPasswordIsNeeded(() => {
        keyvaultSaveMnemonic(userMnemonic);
        !isButtonDisabled && setPage(config.WIZARD_PAGES.WALLET.IMPORT_VALIDATORS);
      });
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
        isLoading={isLoading}
        duplicatedMnemonic={userMnemonic}
        setDuplicatedMnemonic={setUserMnemonic}
        onNextButtonClick={onSaveAndConfirmClick}
        isSaveAndConfirmEnabled={() => { return !userMnemonicError; }}
        onDuplicateMnemonicBlur={onUserMnemonicBlur}
        showDuplicatedMnemonicError={!!userMnemonicError}
      />
    </div>
  );
};

type Page = number;

type ImportPassphraseProps = {
  page: Page;
  setPage: (page: Page) => void;
  isLoading: boolean;
  keyVaultActions: Record<string, any>;
};

const mapStateToProps = (state) => ({
  isLoading: getIsLoading(state),
});

const mapDispatchToProps = (dispatch) => ({
  keyVaultActions: bindActionCreators(actionsFromKeyvault, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(ImportPassphrase);
