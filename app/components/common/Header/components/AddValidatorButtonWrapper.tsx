import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import useRouting from '~app/common/hooks/useRouting';
import { MODAL_TYPES } from '~app/components/Dashboard/constants';
import * as actionsFromWizard from '~app/components/Wizard/actions';
import Connection from '~app/backend/common/store-manager/connection';
import * as actionsFromAccounts from '~app/components/Accounts/actions';
import * as actionsFromDashboard from '~app/components/Dashboard/actions';
import useProcessRunner from '~app/components/ProcessRunner/useProcessRunner';
import { getLatestVersion } from '~app/components/KeyVaultManagement/selectors';
import usePasswordHandler from '~app/components/PasswordHandler/usePasswordHandler';
import { getWalletStatus, getWalletVersion } from '~app/components/Wizard/selectors';

/**
 * Wrapper for any element, so that element would call complex
 * create/import validator flow
 */
const AddValidatorButtonWrapper = (props: AddValidatorButtonWrapperProps) => {
  const { dashboardActions, accountsActions, wizardActions, walletStatus,
    keyvaultCurrentVersion, keyvaultLatestVersion, children, style } = props;
  const { setModalDisplay, clearModalDisplayData } = dashboardActions;
  const { setAddAnotherAccount } = accountsActions;
  const { setFinishedWizard, setOpenedWizard, clearDecryptKeyStores, clearDecryptProgress } = wizardActions;
  const walletNeedsUpdate = keyvaultCurrentVersion !== keyvaultLatestVersion;
  const { checkIfPasswordIsNeeded } = usePasswordHandler();
  const { goToPage, ROUTES } = useRouting();
  const { clearProcessState, isLoading, isDone, error } = useProcessRunner();

  /**
   * Open create/import validator wizard
   */
  const createValidatorWizardActivator = () => {
    clearDecryptKeyStores();
    clearDecryptProgress();
    setAddAnotherAccount(true);
    setFinishedWizard(false);
    setOpenedWizard(true);
    clearModalDisplayData();
    goToPage(ROUTES.WIZARD);
  };

  /**
   * Confirm KeyVault reactivation
   */
  const reactivationDialogActivator = () => {
    setModalDisplay({
      show: true,
      type: MODAL_TYPES.REACTIVATE_KEYVAULT_REQUEST,
      text: 'Please reactivate your KeyVault before creating a validator',
      confirmation: {
        title: 'Inactive KeyVault',
        confirmButtonText: 'Reactivate KeyVault',
        cancelButtonText: 'Later',
        onConfirmButtonClick: () => {
          setModalDisplay({
            show: true,
            type: MODAL_TYPES.REACTIVATION,
            text: 'Your KeyVault is inactive. Please reactivate your KeyVault before creating a new validator.'
          });
        },
        onCancelButtonClick: () => clearModalDisplayData()
      }
    });
  };

  /**
   * Confirm KeyVault update
   */
  const updateKeyVaultDialogActivator = () => {
    const title = 'Update KeyVault';
    const confirmButtonText = title;
    setModalDisplay({
      show: true,
      type: MODAL_TYPES.UPDATE_KEYVAULT_REQUEST,
      text: 'Please update your KeyVault before creating a validator',
      confirmation: {
        title,
        confirmButtonText,
        cancelButtonText: 'Later',
        onConfirmButtonClick: () => {
          setModalDisplay({ show: true, type: MODAL_TYPES.UPDATE });
        },
        onCancelButtonClick: () => clearModalDisplayData()
      }
    });
  };

  /**
   * Show dialog using callback and require password if needed
   */
  const showPasswordProtectedDialog = async (callback) => {
    const cryptoKey = 'temp';
    const isTemporaryCryptoKeyValid = await Connection.db().isCryptoKeyValid(cryptoKey);
    if (isTemporaryCryptoKeyValid) {
      // If temp crypto key is valid - we should set it anyway
      await Connection.db().setCryptoKey(cryptoKey);
    }

    return isTemporaryCryptoKeyValid
      ? callback()
      : checkIfPasswordIsNeeded(callback);
  };

  /**
   * Root function of calling import/create validator logic
   */
  const onAddValidatorClick = async () => {
    if ((!isLoading && isDone) || error) {
      clearProcessState();
    }

    if (walletNeedsUpdate) {
      return showPasswordProtectedDialog(updateKeyVaultDialogActivator);
    }

    if (walletStatus !== 'active') {
      return showPasswordProtectedDialog(reactivationDialogActivator);
    }

    return showPasswordProtectedDialog(createValidatorWizardActivator);
  };

  return (
    <div
      role="button"
      onClick={() => { return onAddValidatorClick(); }}
      onKeyUp={(event) => {
        if (event.keyCode === 0 || event.keyCode === 32) {
          return onAddValidatorClick();
        }
        return null;
      }}
      tabIndex={0}
      style={style || {}}
    >
      {children}
    </div>
  );
};

interface AddValidatorButtonWrapperProps {
  style?: object;
  children: React.ReactChildren | any;
  walletStatus: string;
  wizardActions: Record<string, any>;
  accountsActions: Record<string, any>;
  dashboardActions: Record<string, any>;
  keyvaultCurrentVersion: string;
  keyvaultLatestVersion: string;
}

const mapDispatchToProps = (dispatch) => ({
  wizardActions: bindActionCreators(actionsFromWizard, dispatch),
  accountsActions: bindActionCreators(actionsFromAccounts, dispatch),
  dashboardActions: bindActionCreators(actionsFromDashboard, dispatch)
});

const mapStateToProps = (state) => ({
  walletStatus: getWalletStatus(state),
  keyvaultCurrentVersion: getWalletVersion(state),
  keyvaultLatestVersion: getLatestVersion(state),
});

export default connect(mapStateToProps, mapDispatchToProps)(AddValidatorButtonWrapper);
