import React, {useState} from 'react';
import styled from 'styled-components';
import {Wrapper} from '~app/components/Migration/styles';
import FirstStep from '~app/components/Migration/Migration/FirstStep/FirstStep';
import SecondStep from '~app/components/Migration/Migration/SecondStep/SecondStep';
import ThirdStep from '~app/components/Migration/Migration/ThirdStep/ThirdStep';
import MigrationProgress from '~app/components/Migration/Migration/MigrationProgress/MigrationProgress';

const CustomWrapper = styled(Wrapper)`
  padding: 0;
`;

const STEPS = {
  FIRST_STEP: 0,
  SECOND_STEP: 1,
  THIRD_STEP: 2,
};

const Migration = ({changeToPrevFlow}: {changeToPrevFlow: () => void}) => {
  const [currentStep, setCurrentStep] = useState(STEPS.FIRST_STEP);

  const components = {
    [STEPS.FIRST_STEP]: () => <FirstStep nextStep={nextStep} cancelHandler={cancelButtonHandler} />,
    [STEPS.SECOND_STEP]: () => <SecondStep nextStep={nextStep} />,
    [STEPS.THIRD_STEP]: () => <ThirdStep />
  };

  const nextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const cancelButtonHandler = () => {
    if (currentStep > STEPS.FIRST_STEP) {
      setCurrentStep(currentStep - 1);
    } else {
      changeToPrevFlow();
    }
  };

  const Component = components[currentStep];

  return (
    <CustomWrapper>
      <MigrationProgress currentStep={currentStep} />
      <Wrapper>
        <Component />
      </Wrapper>
    </CustomWrapper>
  );
};

export default Migration;
