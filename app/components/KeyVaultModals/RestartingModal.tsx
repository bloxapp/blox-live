import React, { useEffect } from 'react';
import { ModalTemplate, ProcessLoader } from 'common/components';
import useProcessRunner from 'components/ProcessRunner/useProcessRunner';
import { Title, SmallText } from 'common/components/ModalTemplate/components';

import image from '../Wizard/assets/img-key-vault-inactive.svg';

const RestartingModal = (props: Props) => {
  const { isLoading, processMessage, isDone, isServerActive, processName,
    startProcess, clearProcessState, loaderPercentage} = useProcessRunner();

  const { move1StepForward, move2StepsForward, onClose } = props;

  useEffect(() => {
    if (isDone) {
      clearProcessState();
      isServerActive ? move1StepForward() : move2StepsForward();
    }
    if (!isDone && !isLoading && !processMessage && !processName) {
      startProcess('restart', 'Checking KeyVault configuration...', null);
    }
  }, [isLoading, isDone, processMessage]);

  return (
    <ModalTemplate onClose={onClose} image={image}>
      <Title>Restarting KeyVault</Title>
      <ProcessLoader text={processMessage} precentage={loaderPercentage} />
      <SmallText withWarning />
    </ModalTemplate>
  );
};

type Props = {
  move1StepForward: () => void;
  move2StepsForward: () => void;
  onClose?: () => void;
};

export default RestartingModal;
