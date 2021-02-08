import React, { useEffect } from 'react';
import { MODAL_TYPES } from '../../Dashboard/constants';
import Connection from 'backend/common/store-manager/connection';
import { ProcessLoader, ModalTemplate } from 'common/components';
import useProcessRunner from 'components/ProcessRunner/useProcessRunner';

import { Title, SmallText, Wrapper } from 'common/components/ModalTemplate/components';

import image from 'assets/images/img-recovery.svg';

const RecoveringModal = (props: Props) => {
  const { isLoading, processMessage, isDone, isServerActive, clearProcessState, loaderPercentage } = useProcessRunner();
  const { move1StepForward, move2StepsForward, type } = props;

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
  move1StepForward: () => void;
  move2StepsForward: () => void;
  type: string;
};

export default RecoveringModal;
