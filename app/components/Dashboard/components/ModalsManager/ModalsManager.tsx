import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import useRouting from '~app/common/hooks/useRouting';
import * as actionsFromUser from '~app/components/User/actions';
import * as selectors from '~app/components/Dashboard/selectors';
import { MODAL_TYPES } from '~app/components/Dashboard/constants';
import * as actionsFromWizard from '~app/components/Wizard/actions';
import * as actionsFromAccounts from '~app/components/Accounts/actions';
import ActiveValidatorModal from '~app/components/ActiveValidatorModal';
import * as actionsFromDashboard from '~app/components/Dashboard/actions';
import useDashboardData from '~app/components/Dashboard/useDashboardData';
import { getActiveValidators } from '~app/components/EventLogs/selectors';
import {
  KeyVaultReactivation,
  KeyVaultUpdate,
  DepositInfoModal,
  AccountRecovery } from '~app/components';
import {
  PasswordModal,
  FailureModal,
  ThankYouModal,
  WalletMustUpgradeModal,
  MergeIsComingModal,
  ConfirmationModal } from '~app/components/KeyVaultModals';
// @ts-ignore
import imageImportFailed from '../../../Wizard/assets/img-import-failed.svg';

const ModalsManager = (props: Props) => {
  const { dashboardActions, wizardActions, accountsActions, userActions,
    showModal, modalType, onSuccess, activeValidators, modalData, modalText, displayCloseButton } = props;
  const { clearModalDisplayData, setModalDisplay } = dashboardActions;
  const { loadWallet, setFinishedWizard, clearDecryptKeyStores, clearDecryptProgress } = wizardActions;
  const { loadAccounts } = accountsActions;
  const { loadUserInfo } = userActions;
  const { goToPage, ROUTES } = useRouting();
  const { loadDashboardData } = useDashboardData();

  const onPasswordSuccess = () => {
    clearModalDisplayData();
    onSuccess();
  };

  const onKeyVaultProcessSuccess = async () => {
    await loadWallet();
    await clearModalDisplayData();
    await loadDashboardData();
    goToPage(ROUTES.DASHBOARD);
  };

  const onAccountRecoverySuccess = async () => {
    clearDecryptKeyStores();
    clearDecryptProgress();
    setFinishedWizard(true);
    loadUserInfo();
    loadWallet();
    loadAccounts();
    clearModalDisplayData();
    await loadDashboardData();
    goToPage(ROUTES.DASHBOARD);
  };

  const onClose = () => {
    clearModalDisplayData();
    clearDecryptKeyStores();
    clearDecryptProgress();
  };

  if (showModal) {
    switch (modalType) {
      case MODAL_TYPES.PASSWORD:
        return (
          <PasswordModal
            onClick={onPasswordSuccess}
            onClose={() => onClose()}
          />
        );
      case MODAL_TYPES.REACTIVATION:
        return (
          <KeyVaultReactivation
            onSuccess={() => onKeyVaultProcessSuccess()}
            onClose={() => onClose()}
          />
        );
      case MODAL_TYPES.UPDATE:
        return (
          <KeyVaultUpdate
            onClose={() => onClose()}
            onSuccess={() => onKeyVaultProcessSuccess()}
            rewardAddressesData={modalData.data}
          />
        );
      case MODAL_TYPES.MUST_UPDATE_APP:
        return (
          <WalletMustUpgradeModal
            onClose={displayCloseButton ? onClose : null}
            text={modalText}
          />
        );
      case MODAL_TYPES.DEPOSIT_INFO:
        return <DepositInfoModal onClose={() => onClose()} />;

      case MODAL_TYPES.MERGE_COMING:
        return <MergeIsComingModal />;

      case MODAL_TYPES.ACTIVE_VALIDATOR:
        return activeValidators.length > 0 && (
          <ActiveValidatorModal
            onClose={() => onClose()}
            activeValidators={activeValidators}
          />
        );
      case MODAL_TYPES.DEVICE_SWITCH:
      case MODAL_TYPES.FORGOT_PASSWORD:
        return (
          <AccountRecovery
            onSuccess={() => onAccountRecoverySuccess()}
            onClose={() => onClose()}
            type={modalType}
          />
        );
      case MODAL_TYPES.VALIDATORS_IMPORT_FAILED:
        return (
          <FailureModal
            title="Failed to Import"
            subtitle="Please contact our support to help with the import."
            customImage={imageImportFailed}
            onClose={() => {
              onClose();
              goToPage(ROUTES.DASHBOARD);
            }}
            onClick={() => {
              setModalDisplay({ show: true, type: MODAL_TYPES.VALIDATORS_IMPORT_FAILED_THANKS });
            }}
          />
        );
      case MODAL_TYPES.VALIDATORS_IMPORT_FAILED_THANKS:
        return (
          <ThankYouModal
            onClose={async () => {
              setFinishedWizard(true);
              await loadDashboardData();
              onClose();
              goToPage(ROUTES.DASHBOARD);
            }}
            customImage={imageImportFailed}
          />
        );
      case MODAL_TYPES.UPDATE_KEYVAULT_REQUEST:
      case MODAL_TYPES.REACTIVATE_KEYVAULT_REQUEST:
      case MODAL_TYPES.COMPLIANCE_MODAL:
        return (
          <ConfirmationModal
            text={modalData.text}
            onSuccess={modalData.onSuccess}
            confirmation={modalData.confirmation}
          />
        );
      default:
        return null;
    }
  }
  return null;
};

const mapStateToProps = (state) => ({
  modalType: selectors.getModalType(state),
  modalText: selectors.getModalText(state),
  modalData: selectors.getModalData(state),
  activeValidators: getActiveValidators(state),
  onSuccess: selectors.getModalOnSuccess(state),
  showModal: selectors.getModalDisplayStatus(state),
  displayCloseButton: selectors.getModalDisplayCloseButton(state),
});

const mapDispatchToProps = (dispatch) => ({
  userActions: bindActionCreators(actionsFromUser, dispatch),
  wizardActions: bindActionCreators(actionsFromWizard, dispatch),
  accountsActions: bindActionCreators(actionsFromAccounts, dispatch),
  dashboardActions: bindActionCreators(actionsFromDashboard, dispatch),
});

type Props = {
  dashboardActions: Record<string, any>;
  wizardActions: Record<string, any>;
  accountsActions: Record<string, any>;
  userActions: Record<string, any>;
  showModal: boolean;
  modalType: string;
  displayCloseButton: boolean;
  modalText: string;
  onSuccess: () => void;
  activeValidators: [{ publicKey: string }],
  modalData: Record<string, any>;
};

export default connect(mapStateToProps, mapDispatchToProps)(ModalsManager);
