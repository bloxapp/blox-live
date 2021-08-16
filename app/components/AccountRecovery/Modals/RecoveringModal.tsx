import React, { useEffect } from 'react';
import { MODAL_TYPES } from '~app/components/Dashboard/constants';
import Connection from '~app/backend/common/store-manager/connection';
import { ProcessLoader, ModalTemplate } from '~app/common/components';
import useProcessRunner from '~app/components/ProcessRunner/useProcessRunner';
import { Title, SmallText, Wrapper } from '~app/common/components/ModalTemplate/components';
// @ts-ignore
import image from 'assets/images/img-recovery.svg';

const RecoveringModal = (props: Props) => {
  const { move1StepForward, move2StepsForward, type } = props;
  const { isLoading, processMessage, isDone, isServerActive, clearProcessState, loaderPercentage } = useProcessRunner();

  const onSuccess = () => {
    move1StepForward();
    if (type === MODAL_TYPES.DEVICE_SWITCH) {
      Connection.db().delete('inRecoveryProcess');
    }
    else if (type === MODAL_TYPES.FORGOT_PASSWORD) {
      Connection.db().delete('inForgotPasswordProcess');
    }
  };

  const onFailure = () => move2StepsForward();

  useEffect(() => {
    if (isDone) {
      clearProcessState();
      isServerActive ? onSuccess() : onFailure();
    }
  }, [isLoading, isDone, processMessage]);

  return (
    <ModalTemplate image={image}>
      <Title>Recovering Your Account</Title>
      <Wrapper>
        <ProcessLoader text={processMessage} precentage={loaderPercentage} />
      </Wrapper>
      <SmallText withWarning />
    </ModalTemplate>
  );
};

type Props = {
  type: string;
  move1StepForward: () => void;
  move2StepsForward: () => void;
};

export default RecoveringModal;
