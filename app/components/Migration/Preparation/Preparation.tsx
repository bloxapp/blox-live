import React, {useState} from 'react';
import styled from 'styled-components';
import {Wrapper, Title} from '~app/components/Migration/styles';
import FirstStep from './FirstStep';
import ThirdStep from './ThirdStep';
import SecondStep from './SecondStep';

const PreparationWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 20px;
  padding: 0 15px 0 15px;
`;

const Lines = styled.div`
  gap: 8px;
  width: 100%;
  display: flex;
  flex-direction: row;
  padding: 0 0 0 20px;
`;

const Line = styled.div<{ isActive: boolean }>`
  width: 252px;
  height: 4px;
  background-color: ${({ isActive }) => isActive ? '#1BA5F8' : '#CBD3E5'};
  margin-right: 8px;
`;

const STEPS = {
  FIRST_STEP: 0,
  SECOND_STEP: 1,
  THIRD_STEP: 2,
};

const Preparation = ({changeToNextFlow, changeToPrevFlow}: {changeToNextFlow: () => void; changeToPrevFlow: () => void}) => {
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
      changeToPrevFlow();
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
      <PreparationWrapper>
        <Title>SSV Migration Preparation</Title>
        <Lines>
          <Line isActive={currentStep >= 0} />
          <Line isActive={currentStep >= 1} />
          <Line isActive={currentStep >= 2} />
        </Lines>
      </PreparationWrapper>
      <Component goToNexStep={nextStepHandler} cancelHandler={cancelButtonHandler} />
    </Wrapper>
  );
};

export default Preparation;
