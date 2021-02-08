import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { MODAL_TYPES } from '../../../Dashboard/constants';
import { getWalletStatus } from '../../../Wizard/selectors';
import * as actionsFromWizard from '../../../Wizard/actions';
import * as actionsFromAccounts from '../../../Accounts/actions';
import * as actionsFromDashboard from '../../../Dashboard/actions';
import Connection from '../../../../backend/common/store-manager/connection';
import usePasswordHandler from '../../../PasswordHandler/usePasswordHandler';

const AddValidatorButtonWrapper = (props: AddValidatorButtonWrapperProps) => {
  const { dashboardActions, accountsActions, wizardActions, walletStatus, children, style } = props;
  const { setModalDisplay, clearModalDisplayData } = dashboardActions;
  const { setAddAnotherAccount } = accountsActions;
  const { setFinishedWizard } = wizardActions;
  const { checkIfPasswordIsNeeded } = usePasswordHandler();

  const onAddValidatorPasswordSuccess = () => {
    setAddAnotherAccount(true);
    setFinishedWizard(false);
    clearModalDisplayData();
  };

  const addValidatorHandler = async () => {
    if (walletStatus === 'active') {
      const cryptoKey = 'temp';
      const isTemporaryCryptoKeyValid = await Connection.db().isCryptoKeyValid(cryptoKey);
      if (isTemporaryCryptoKeyValid) {
        // If temp crypto key is valid - we should set it anyway
        await Connection.db().setCryptoKey(cryptoKey);
      }

      // If credentials exists - they was saved with "temp" or user password before
      if (Connection.db().exists('credentials')) {
        if (isTemporaryCryptoKeyValid) {
          // If temp crypto key is valid - we don't show dialog with required password
          onAddValidatorPasswordSuccess();
        } else {
          // Otherwise user was able to set his own password, and we ask to enter it
          checkIfPasswordIsNeeded(onAddValidatorPasswordSuccess);
        }
      } else {
        // If credentials doesn't exists - it means user didn't install key vault
        onAddValidatorPasswordSuccess();
      }
      return;
    }
    const text = 'Your KeyVault is inactive. Please reactivate your KeyVault before creating a new validator.';
    setModalDisplay({ show: true, type: MODAL_TYPES.REACTIVATION, text });
  };

  return (
    <div
      role="button"
      onClick={() => { return addValidatorHandler(); }}
      onKeyUp={(event) => {
        if (event.keyCode === 0 || event.keyCode === 32) {
          return addValidatorHandler();
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
}

const mapDispatchToProps = (dispatch) => ({
  wizardActions: bindActionCreators(actionsFromWizard, dispatch),
  accountsActions: bindActionCreators(actionsFromAccounts, dispatch),
  dashboardActions: bindActionCreators(actionsFromDashboard, dispatch)
});

const mapStateToProps = (state) => ({
  walletStatus: getWalletStatus(state)
});

export default connect(mapStateToProps, mapDispatchToProps)(AddValidatorButtonWrapper);
