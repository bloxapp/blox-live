import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import config from '~app/backend/common/config';
import * as Modals from '~app/components/AccountRecovery/Modals';
import { MODAL_TYPES } from '~app/components/Dashboard/constants';
import Connection from '~app/backend/common/store-manager/connection';
import { getWalletSeedlessFlag } from '~app/components/Wizard/selectors';
import * as SeedlessModals from '~app/components/AccountRecovery/SeedlessModals';
import { FailureModal, SuccessModal, ThankYouModal } from '~app/components/KeyVaultModals';

const { WelcomeModal, Step1Modal, Step2Modal, RecoveringModal } = Modals;
const { SeedlessKeystoreStepModal, SeedlessSummaryStepModal, SeedlessPasswordStepModal } = SeedlessModals;
const successText = 'You\'re all set! This is now your primary device and you have full access to your Blox staking account.';

const AccountRecovery = (props: AccountRecoveryProps) => {
  const { onSuccess, onClose, type, isSeedless } = props;
  const [step, setStep] = useState(0);
  const move1StepForward = () => setStep(step + 1);
  const move1StepBackward = () => setStep(step - 1);
  const move2StepsForward = () => setStep(step + 2);
  const onCloseClick = type !== MODAL_TYPES.DEVICE_SWITCH ? () => onClose() : null;

  useEffect(() => {
    if (isSeedless) {
      Connection.db().set(config.FLAGS.VALIDATORS_MODE.KEY, config.FLAGS.VALIDATORS_MODE.KEYSTORE);
    }
  }, [isSeedless]);

  if (isSeedless) {
    switch (step) {
      default:
      case 0:
        return (
          <WelcomeModal
            type={type}
            onClose={onCloseClick}
            onClick={move1StepForward}
          />
        );
      case 1:
        return (
          <SeedlessKeystoreStepModal
            onClose={onCloseClick}
            onClick={move1StepForward}
          />
        );
      case 2:
        return (
          <SeedlessSummaryStepModal
            onClick={move1StepForward}
            goBack={move1StepBackward}
          />
        );
      case 3:
        return (
          <SeedlessPasswordStepModal
            type={type}
            onClick={move1StepForward}
          />
        );
      case 4:
        return (
          <Step2Modal
            type={type}
            onClick={move1StepForward}
          />
        );
      case 5:
        return (
          <RecoveringModal
            type={type}
            move1StepForward={move1StepForward}
            move2StepsForward={move2StepsForward}
          />
        );
      case 6:
        return (
          <SuccessModal
            text={successText}
            onSuccess={onSuccess}
            title={'Account Recovered'}
          />
        );
      case 7:
        return (
          <FailureModal
            onClick={move1StepForward}
            title={'Failed To Recover'}
          />
        );
      case 8:
        return (
          <ThankYouModal
            type={type}
          />
        );
    }
  }

  switch (step) {
    case 0:
      return (
        <WelcomeModal
          type={type}
          onClose={onCloseClick}
          onClick={move1StepForward}
        />
      );
    case 1:
      return (
        <Step1Modal
          onClose={onCloseClick}
          onClick={move1StepForward}
        />
      );
    case 2:
      return (
        <Step2Modal
          type={type}
          onClick={move1StepForward}
        />
      );
    case 3:
      return (
        <RecoveringModal
          type={type}
          move1StepForward={move1StepForward}
          move2StepsForward={move2StepsForward}
        />
      );
    case 4:
      return (
        <SuccessModal
          text={successText}
          onSuccess={onSuccess}
          title={'Account Recovered'}
        />
      );
    case 5:
      return (
        <FailureModal
          onClick={move1StepForward}
          title={'Failed To Recover'}
        />
      );
    case 6:
      return (
        <ThankYouModal
          type={type}
        />
      );
    default:
      return (
        <WelcomeModal
          type={type}
          onClose={onCloseClick}
          onClick={move1StepForward}
        />
      );
  }
};

type AccountRecoveryProps = {
  type: string;
  isSeedless: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

const mapStateToProps = (state) => ({
  isSeedless: getWalletSeedlessFlag(state)
});

export default connect(mapStateToProps, null)(AccountRecovery);
