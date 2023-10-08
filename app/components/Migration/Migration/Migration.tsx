import React, {useState} from 'react';
import styled from 'styled-components';
import {Wrapper} from '~app/components/Migration/styles';
import FirstStep from '~app/components/Migration/Migration/FirstStep/FirstStep';
import SecondStep from '~app/components/Migration/Migration/SecondStep/SecondStep';
import MigrationProgress from '~app/components/Migration/Migration/MigrationProgress/MigrationProgress';

const CustomWrapper = styled(Wrapper)`
  padding: 0;
`;

const STEPS = {
  FIRST_STEP: 0,
  SECOND_STEP: 1,
};

const Migration = ({nextFlow}: {nextFlow: any}) => {
  const [currentStep, setCurrentStep] = useState(STEPS.FIRST_STEP);

  const components = {
    [STEPS.FIRST_STEP]: FirstStep,
    [STEPS.SECOND_STEP]: SecondStep
  };

  const nextStep = () => setCurrentStep(currentStep === STEPS.FIRST_STEP ? STEPS.SECOND_STEP : STEPS.FIRST_STEP);

  const cancelButtonHandler = () => {
    if (currentStep > STEPS.FIRST_STEP) {
      setCurrentStep(currentStep - 1);
    } else {
      nextFlow();
    }
  };

  const Component = components[currentStep];

  return (
    <CustomWrapper>
      <MigrationProgress currentStep={currentStep} />
      <Wrapper>
        <Component nextStep={nextStep} cancelHandler={cancelButtonHandler} />
      </Wrapper>
    </CustomWrapper>
  );
};

export default Migration;
