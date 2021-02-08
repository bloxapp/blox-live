import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { KeyVaultReactivation, KeyVaultUpdate, DepositInfoModal, AccountRecovery } from '../../..';
import { PasswordModal, FailureModal, ThankYouModal } from '../../../KeyVaultModals';
import ActiveValidatorModal from '../../../ActiveValidatorModal';

import * as actionsFromDashboard from '../../actions';
import * as actionsFromWizard from '../../../Wizard/actions';
import * as actionsFromAccounts from '../../../Accounts/actions';
import * as actionsFromUser from '../../../User/actions';
import * as selectors from '../../selectors';
import { getActiveValidators } from '../../../EventLogs/selectors';

import { MODAL_TYPES } from '../../constants';

import imageImportFailed from '../../../Wizard/assets/img-import-failed.svg';

const ModalsManager = (props: Props) => {
  const { dashboardActions, wizardActions, accountsActions, userActions, showModal, modalType, onSuccess, activeValidators } = props;
  const { clearModalDisplayData, setModalDisplay } = dashboardActions;
  const { loadWallet, setFinishedWizard } = wizardActions;
  const { loadAccounts } = accountsActions;
  const { loadUserInfo } = userActions;

  const onPasswordSuccess = () => {
    clearModalDisplayData();
    onSuccess();
  };

  const onKeyvaultProcessSuccess = async () => {
    await loadWallet();
    await clearModalDisplayData();
  };

  const onAccountRecoverySuccess = () => {
    setFinishedWizard(true);
    loadUserInfo();
    loadWallet();
    loadAccounts();
    clearModalDisplayData();
  };

  if (showModal) {
    switch (modalType) {
      case MODAL_TYPES.PASSWORD:
        return <PasswordModal onClick={onPasswordSuccess} onClose={() => clearModalDisplayData()} />;
      case MODAL_TYPES.REACTIVATION:
        return <KeyVaultReactivation onSuccess={() => onKeyvaultProcessSuccess()} onClose={() => clearModalDisplayData()} />;
      case MODAL_TYPES.UPDATE:
        return <KeyVaultUpdate onSuccess={() => onKeyvaultProcessSuccess()} onClose={() => clearModalDisplayData()} />;
      case MODAL_TYPES.DEPOSIT_INFO:
        return <DepositInfoModal onClose={() => clearModalDisplayData()} />;
      case MODAL_TYPES.ACTIVE_VALIDATOR:
        return activeValidators.length > 0 && (
          <ActiveValidatorModal onClose={() => clearModalDisplayData()} activeValidators={activeValidators} />
        );
      case MODAL_TYPES.DEVICE_SWITCH:
      case MODAL_TYPES.FORGOT_PASSWORD:
        return <AccountRecovery onSuccess={() => onAccountRecoverySuccess()} onClose={() => clearModalDisplayData()} type={modalType} />;
      case MODAL_TYPES.VALIDATORS_IMPORT_FAILED:
        return (
          <FailureModal
            title="Failed to Import"
            customImage={imageImportFailed}
            onClick={() => {
              setModalDisplay({ show: true, type: MODAL_TYPES.VALIDATORS_IMPORT_FAILED_THANKS });
            }}
          />
        );
      case MODAL_TYPES.VALIDATORS_IMPORT_FAILED_THANKS:
        return (
          <ThankYouModal
            onClose={() => clearModalDisplayData()}
            customImage={imageImportFailed}
          />
        );
      default:
        return null;
    }
  }
  return null;
};

const mapStateToProps = (state) => ({
  showModal: selectors.getModalDisplayStatus(state),
  modalType: selectors.getModalType(state),
  modalText: selectors.getModalText(state),
  onSuccess: selectors.getModalOnSuccess(state),
  activeValidators: getActiveValidators(state),
});

const mapDispatchToProps = (dispatch) => ({
  dashboardActions: bindActionCreators(actionsFromDashboard, dispatch),
  wizardActions: bindActionCreators(actionsFromWizard, dispatch),
  accountsActions: bindActionCreators(actionsFromAccounts, dispatch),
  userActions: bindActionCreators(actionsFromUser, dispatch),
});

type Props = {
  dashboardActions: Record<string, any>;
  wizardActions: Record<string, any>;
  accountsActions: Record<string, any>;
  userActions: Record<string, any>;
  showModal: boolean;
  modalType: string;
  onSuccess: () => void;
  activeValidators: [{ publicKey: string }],
};

export default connect(mapStateToProps, mapDispatchToProps)(ModalsManager);
