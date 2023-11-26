import React, {useState} from 'react';
import useRouting from '~app/common/hooks/useRouting';
import {Wrapper} from '~app/components/Migration/styles';
import FirstStep from '~app/components/Migration/Preparation/FirstStep/FirstStep';
import ThirdStep from '~app/components/Migration/Preparation/ThirdStep/ThirdStep';
import SecondStep from '~app/components/Migration/Preparation/SecondStep/SecondStep';
import PreparationProgress from '~app/components/Migration/Preparation/PreparationProgress/PreparationProgress';

const STEPS = {
  FIRST_STEP: 0,
  SECOND_STEP: 1,
  THIRD_STEP: 2,
};

const Preparation = ({changeToNextFlow}: {changeToNextFlow: () => void}) => {
  const { goToPage, ROUTES } = useRouting();
  const [currentStep, setCurrentStep] = useState<number>(STEPS.FIRST_STEP);

  const nextStepHandler = () => {
    if (currentStep === STEPS.THIRD_STEP) {
      changeToNextFlow();
    } else {
      setCurrentStep(currentStep === STEPS.SECOND_STEP ? STEPS.THIRD_STEP : STEPS.SECOND_STEP);
    }
  };

  const cancelButtonHandler = () => {
    if (currentStep > STEPS.FIRST_STEP) {
      setCurrentStep(currentStep - 1);
    } else {
      goToPage(ROUTES.DASHBOARD);
    }
  };

  const steps = {
    [STEPS.FIRST_STEP]: FirstStep,
    [STEPS.SECOND_STEP]: SecondStep,
    [STEPS.THIRD_STEP]: ThirdStep,
  };

  const Component = steps[currentStep];

  return (
    <Wrapper>
      <PreparationProgress currentStep={currentStep} />
      <Component goToNexStep={nextStepHandler} cancelHandler={cancelButtonHandler} />
    </Wrapper>
  );
};

export default Preparation;
