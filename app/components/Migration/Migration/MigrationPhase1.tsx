import React, {useState} from 'react';
import styled from 'styled-components';
import {Wrapper} from '~app/components/Migration/styles';
import Phase1Step1 from './Phase1Step1';
import Phase1Step2 from './Phase1Step2';
import Phase1Step3 from './Phase1Step3';
import MigrationProgress from './MigrationStepsBar';
import {SSVMigrationStatus} from '~app/backend/services/users/users.service';

const CustomWrapper = styled(Wrapper)`
  padding: 0;
`;

const STEPS = {
  FIRST_STEP: 0,
  SECOND_STEP: 1,
  THIRD_STEP: 2,
};

const MigrationPhase1 = ({ changeToPrevFlow, migrationStatus }: {changeToPrevFlow: () => void; migrationStatus: SSVMigrationStatus }) => {
  const [currentStep, setCurrentStep] = useState(migrationStatus === SSVMigrationStatus.CREATED_KEYSHARES ? STEPS.THIRD_STEP : STEPS.FIRST_STEP);

  const components = {
    [STEPS.FIRST_STEP]: () => <Phase1Step1 nextStep={nextStep} cancelHandler={cancelButtonHandler} />,
    [STEPS.SECOND_STEP]: () => <Phase1Step2 nextStep={nextStep} />,
    [STEPS.THIRD_STEP]: () => <Phase1Step3 />
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

export default MigrationPhase1;
