import React, { useState } from 'react';
import {
  WelcomeModal, RestartingModal, SuccessModal,
  ReinstallingModal, FailureModal, ThankYouModal
} from '~app/components/KeyVaultModals';
import inactiveImage from '../Wizard/assets/img-key-vault-inactive.svg';

const successText = 'KeyVault is active and all validators are staking normally. We are investigating what caused the issue.';

const KeyVaultReactivation = ({onSuccess, onClose}: Props) => {
  const [step, setStep] = useState(1);
  const move1StepForward = () => setStep(step + 1);
  const move2StepsForward = () => setStep(step + 2);
  switch (step) {
    case 1:
      return <WelcomeModal onClick={move1StepForward} onClose={onClose} />;
    case 2:
      return <RestartingModal move1StepForward={move1StepForward} move2StepsForward={move2StepsForward} />;
    case 3:
      return <SuccessModal title={'KeyVault Reactivated!'} onSuccess={onSuccess} text={successText} />;
    case 4:
      return (
        <ReinstallingModal
          title={'Reinstalling KeyVault'}
          description={'KeyVault still inactive. Starting the reinstall process.'}
          move1StepForward={move1StepForward}
          move2StepsForward={move2StepsForward}
          image={inactiveImage}
          suggestedProcess="reinstall"
        />
      );
    case 5:
      return <SuccessModal title={'Reactivating your KeyVault'} onSuccess={onSuccess} text={successText} />;
    case 6:
      return <FailureModal title={'Troubleshooting Failed'} onClick={move1StepForward} onClose={onClose} />;
    case 7:
      return <ThankYouModal onClose={onClose} />;
    default:
      return <WelcomeModal onClick={move1StepForward} onClose={onClose} />;
  }
};

type Props = {
  onSuccess: () => void;
  onClose: () => void;
};

export default KeyVaultReactivation;
