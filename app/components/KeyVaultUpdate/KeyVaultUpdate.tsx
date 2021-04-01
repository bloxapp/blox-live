import React, { useState } from 'react';
import {
  SuccessModal,
  ReinstallingModal,
  FailureModal,
  ThankYouModal
} from '~app/components/KeyVaultModals';
import activeImage from '../Wizard/assets/img-key-vault.svg';

const KeyVaultUpdate = ({onSuccess, onClose}: Props) => {
  const [step, setStep] = useState(1);
  const move1StepForward = () => setStep(step + 1);
  const move2StepsForward = () => setStep(step + 2);
  const defaultDialog = (
    <ReinstallingModal
      title={'Updating KeyVault'}
      move1StepForward={move1StepForward}
      move2StepsForward={move2StepsForward}
      image={activeImage}
    />
  );
  switch (step) {
    case 1:
      return defaultDialog;
    case 2:
      return <SuccessModal title={'KeyVault Updated!'} onSuccess={onSuccess} text={'All Validators are now performing normally.'} />;
    case 3:
      return <FailureModal title={'Troubleshooting Failed'} onClick={move1StepForward} onClose={onClose} />;
    case 4:
      return <ThankYouModal onClose={onClose} />;
    default:
      return defaultDialog;
  }
};

type Props = {
  onSuccess: () => void;
  onClose: () => void;
};

export default KeyVaultUpdate;
