import React, { useState } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import config from '~app/backend/common/config';
import { useInjectSaga } from '~app/utils/injectSaga';
import passwordSaga from '~app/components/PasswordHandler/saga';
import keyvaultSaga from '~app/components/KeyVaultManagement/saga';
import BackButton from '~app/components/Wizard/components/common/BackButton';
import * as actionsFromKeyvault from '~app/components/KeyVaultManagement/actions';
import usePasswordHandler from '~app/components/PasswordHandler/usePasswordHandler';
import { getMnemonic, getIsLoading } from '~app/components/KeyVaultManagement/selectors';
import { writeToTxtFile } from '~app/components/Wizard/components/Wallet/Passphrase/service';
import { Regular, Backup } from '~app/components/Wizard/components/Wallet/Passphrase/components';

const keyvaultKey = 'keyvaultManagement';
const passwordKey = 'password';

const Passphrase = (props: PassphraseProps) => {
  const { setPage, mnemonic, isLoading, keyvaultActions } = props;
  const { keyvaultLoadMnemonic, keyvaultSaveMnemonic } = keyvaultActions;

  const [showBackup, toggleBackupDisplay] = useState(false);
  const [duplicatedMnemonic, setDuplicatedMnemonic] = useState('');
  const [showDuplicatedMnemonicError, setDuplicatedMnemonicErrorDisplay] = useState(false);
  const isButtonDisabled = !mnemonic;
  const { checkIfPasswordIsNeeded } = usePasswordHandler();

  useInjectSaga({key: keyvaultKey, saga: keyvaultSaga, mode: ''});
  useInjectSaga({key: passwordKey, saga: passwordSaga, mode: ''});

  const onPassphraseClick = () => {
    if (mnemonic || isLoading) { return; }
    keyvaultLoadMnemonic();
  };

  const onSaveAndConfirmClick = async () => {
    const canGenerate = canGenerateMnemonic();
    if (canGenerate) {
      checkIfPasswordIsNeeded(() => {
        keyvaultSaveMnemonic(duplicatedMnemonic);
        !isButtonDisabled && setPage(config.WIZARD_PAGES.VALIDATOR.SELECT_NETWORK);
      });
    }
  };

  const onDownloadClick = () => {
    if (!mnemonic) { return null; }
    writeToTxtFile('Blox Secret Backup Passphrase', mnemonic);
  };

  const showBackupScreen = () => mnemonic && toggleBackupDisplay(true);

  const canGenerateMnemonic = () => {
    return mnemonic === duplicatedMnemonic;
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
        <Backup
          isLoading={isLoading}
          duplicatedMnemonic={duplicatedMnemonic}
          onNextButtonClick={onSaveAndConfirmClick}
          isSaveAndConfirmEnabled={canGenerateMnemonic}
          setDuplicatedMnemonic={setDuplicatedMnemonic}
          onDuplicateMnemonicBlur={onDuplicateMnemonicBlur}
          showDuplicatedMnemonicError={showDuplicatedMnemonicError}
        />
      ) : (
        <Regular
          mnemonic={mnemonic}
          isLoading={isLoading}
          onDownloadClick={onDownloadClick}
          onNextButtonClick={showBackupScreen}
          onPassphraseClick={onPassphraseClick}
        />
      )}
    </div>
  );
};

type Page = number;

type PassphraseProps = {
  page: Page;
  setPage: (page: Page) => void;
  mnemonic: string;
  isLoading: boolean;
  keyvaultActions: Record<string, any>;
};

const mapStateToProps = (state) => ({
  mnemonic: getMnemonic(state),
  isLoading: getIsLoading(state),
});

const mapDispatchToProps = (dispatch) => ({
  keyvaultActions: bindActionCreators(actionsFromKeyvault, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(Passphrase);
