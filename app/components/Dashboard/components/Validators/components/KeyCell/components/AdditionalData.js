import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import * as actionsFromDashboard from '../../../../../actions';
import { MODAL_TYPES } from '../../../../../constants';

import { loadDepositData, setFinishedWizard } from '../../../../../../Wizard/actions';

import { setDepositNeeded } from '../../../../../../Accounts/actions';

import WarningText from './WarningText';
import BlueButton from './BlueButton';
import Date from './Date';

const AdditionalData = (props) => {
  const { publicKey, status, createdAt, dashboardActions, accountIndex,
          callLoadDepositData, callSetDepositNeeded // callSetFinishedWizard
        } = props;
  const { setModalDisplay } = dashboardActions;

  const onDepositInfoButtonClick = async () => {
    await callLoadDepositData(publicKey, accountIndex);
    await setModalDisplay({ show: true, type: MODAL_TYPES.DEPOSIT_INFO, text: '', });
  };

  const onFinishSetupClick = async () => {
    await callSetDepositNeeded(true, publicKey, accountIndex);
    await setModalDisplay({ show: true, type: MODAL_TYPES.FINISH_SETUP, text: '', });
  };
  if (status === 'pending') {
    return (
      <>
        <WarningText>Waiting for approval</WarningText>
        <BlueButton onClick={() => onDepositInfoButtonClick()}>Deposit Info</BlueButton>
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
  status: PropTypes.string,
  createdAt: PropTypes.string,
  dashboardActions: PropTypes.object,
  callLoadDepositData: PropTypes.func,
  // callSetFinishedWizard: PropTypes.func,
  callSetDepositNeeded: PropTypes.func,
};

const mapDispatchToProps = (dispatch) => ({
  dashboardActions: bindActionCreators(actionsFromDashboard, dispatch),
  callLoadDepositData: (publicKey, accountIndex) => dispatch(loadDepositData(publicKey, accountIndex)),
  // callSetFinishedWizard: (isFinished) => dispatch(setFinishedWizard(isFinished)),
  callSetDepositNeeded: (depositNeeded, publicKey, accountIndex) => dispatch(setDepositNeeded(depositNeeded, publicKey, accountIndex)),
});

export default connect(null, mapDispatchToProps)(AdditionalData);
