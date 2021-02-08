import React, { useEffect } from 'react';
import { ProcessLoader, ModalTemplate } from 'common/components';
import useProcessRunner from 'components/ProcessRunner/useProcessRunner';
import { Title, Description, SmallText, Wrapper } from 'common/components/ModalTemplate/components';

const ReinstallingModal = (props: Props) => {
  const { isLoading, processMessage, isDone, isServerActive, processName,
    startProcess, clearProcessState, loaderPercentage } = useProcessRunner();
  const { title, description, move1StepForward, move2StepsForward, onClose, image } = props;

  useEffect(() => {
    if (isDone) {
      clearProcessState();
      isServerActive ? move1StepForward() : move2StepsForward();
    }
    if (!isDone && !isLoading && !processMessage && !processName) {
      startProcess('reinstall', 'Checking KeyVault configuration...', null);
    }
  }, [isLoading, isDone, processMessage]);

  return (
    <ModalTemplate onClose={onClose} image={image}>
      <Title>{title}</Title>
      <Wrapper>
        {description && <Description>{description}</Description>}
        <ProcessLoader text={processMessage} precentage={loaderPercentage} />
      </Wrapper>
      <SmallText withWarning />
    </ModalTemplate>
  );
};

type Props = {
  image: string;
  title: string;
  description?: string;
  move1StepForward: () => void;
  move2StepsForward: () => void;
  onClose?: () => void;
};

export default ReinstallingModal;
