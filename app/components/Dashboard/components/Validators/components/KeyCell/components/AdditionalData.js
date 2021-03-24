import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import useRouting from '~app/common/hooks/useRouting';
import { setWizardPageData } from '~app/components/Wizard/actions';
import usePasswordHandler from '~app/components/PasswordHandler/usePasswordHandler';
import { setAddAnotherAccount, setDepositNeeded } from '~app/components/Accounts/actions';
import Date from '~app/components/Dashboard/components/Validators/components/KeyCell/components/Date';
import BlueButton from '~app/components/Dashboard/components/Validators/components/KeyCell/components/BlueButton';
import WarningText from '~app/components/Dashboard/components/Validators/components/KeyCell/components/WarningText';

const AdditionalData = (props) => {
  const { publicKey, status, createdAt, accountIndex, callSetWizardPageData,
    callSetDepositNeeded, network, callSetAddAnotherAccount } = props;
  const { checkIfPasswordIsNeeded } = usePasswordHandler();
  const { goToPage, ROUTES } = useRouting();

  const onFinishSetupClick = async () => {
    const onPasswordSuccess = async () => {
      await callSetAddAnotherAccount(false);
      await callSetWizardPageData({
        finishValidatorSetup: true
      });
      await callSetDepositNeeded({
        isNeeded: true,
        publicKey,
        accountIndex,
        network
      });
      goToPage(ROUTES.WIZARD);
    };
    checkIfPasswordIsNeeded(onPasswordSuccess);
  };

  if (['pending', 'deposited'].includes(status)) {
    return (
      <>
        <WarningText>Waiting for approval</WarningText>
      </>
    );
  }
  if (['waiting', 'partially_deposited'].includes(status)) {
    let warningTitle = '';
    if (status === 'waiting') {
      warningTitle = 'Waiting for deposit';
    } else if (status === 'partially_deposited') {
      warningTitle = 'Partial deposited';
    }
    return (
      <>
        <WarningText>{warningTitle}</WarningText>
        <BlueButton onClick={() => onFinishSetupClick()}>Finish Setup</BlueButton>
      </>
    );
  }
  return (
    <Date>Created: {createdAt}</Date>
  );
};

AdditionalData.propTypes = {
  publicKey: PropTypes.string,
  accountIndex: PropTypes.number,
  network: PropTypes.string,
  status: PropTypes.string,
  createdAt: PropTypes.string,
  callSetDepositNeeded: PropTypes.func,
  callSetAddAnotherAccount: PropTypes.func,
  callSetWizardPageData: PropTypes.func,
};

const mapDispatchToProps = (dispatch) => ({
  callSetDepositNeeded: (payload) => dispatch(setDepositNeeded(payload)),
  callSetAddAnotherAccount: (payload) => dispatch(setAddAnotherAccount(payload)),
  callSetWizardPageData: (payload) => dispatch(setWizardPageData(payload)),
});

export default connect(null, mapDispatchToProps)(AdditionalData);
