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

const Migration = ({nextFlow}: {nextFlow: any}) => {
  const [currentStep, setCurrentStep] = useState(STEPS.FIRST_STEP);
  const [ownerAddress, setOwnerAddress] = useState('');

  const components = {
    [STEPS.FIRST_STEP]: (props) => <FirstStep {...props} setOwnerAddress={setOwnerAddress} />,
    [STEPS.SECOND_STEP]: (props) => <SecondStep {...props} ownerAddress={ownerAddress} />,
    [STEPS.THIRD_STEP]: ThirdStep
  };

  const nextStep = () => {
    switch (currentStep) {
      case STEPS.FIRST_STEP:
        setCurrentStep(STEPS.SECOND_STEP);
        break;
      case STEPS.SECOND_STEP:
        setCurrentStep(STEPS.THIRD_STEP);
        break;
      case STEPS.THIRD_STEP:
        setCurrentStep(STEPS.THIRD_STEP);
        break;
    }
  };

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
