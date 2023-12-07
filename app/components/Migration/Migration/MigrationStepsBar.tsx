import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: 30px 0;
`;

const FlowName = styled.p`
  padding: 0 30px;
  color: var(--gray-5, #63768B);
  font-variant-numeric: lining-nums proportional-nums;
  font-feature-settings: 'clig' off, 'liga' off;
  font-family: Avenir, sans-serif;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 22px;
`;

const Wrapper = styled.div`
  display: flex;
  flex: 600px 0 0;
  flex-direction: column;
  padding-top: 10px;
`;

const UpperPartWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0 50px;
  margin-bottom: 10px;
`;

const MigrationStepNumber = styled.div<{ isActive?: boolean; isDone?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 6px;
  ${({ isActive, isDone }) => `border: 2px solid ${isActive || isDone ? '#1BA5F8' : '#97A5BA'};`}
  ${({ isActive, isDone }) => {
    if (isActive) {
      return 'background-color: #FFFFFF; color: #34455A;';
    }
    if (isDone) {
      return 'background-color: #1BA5F8; color: #FFFFFF;';
    }
    return 'background-color: transparent; color: #97A5BA';
  }}
`;

const ProgressBarLine = styled.div<{ isDone: boolean }>`
  display: flex;
  flex: 1;
  height: 2px;
  background-color: ${({ isDone }) => isDone ? '#1BA5F8' : '#97A5BA'};
`;

const LowerPartWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const StepTitle = styled.p<{ isActive: boolean }>`
  color: ${({ isActive }) => isActive ? '#1BA5F8' : '#97A5BA'};
  font-variant-numeric: lining-nums proportional-nums;
  font-feature-settings: 'clig' off, 'liga' off;
  font-family: Avenir, sans-serif;
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  line-height: 16px;
`;

const MigrationStepsBar = ({ currentStep }: { currentStep: number }) => (
  <Container>
    <FlowName>
      ssv.network migration
    </FlowName>
    <Wrapper>
      <UpperPartWrapper>
        <MigrationStepNumber isActive={currentStep === 0} isDone={currentStep > 0}>{currentStep === 0 ? 1 : '&#10003;'}</MigrationStepNumber>
        <ProgressBarLine isDone={currentStep > 0} />
        <MigrationStepNumber isActive={currentStep > 0 && currentStep < 3} isDone={currentStep > 2}>{currentStep <= 1 ? 2 : `${'&#10003;'}`}</MigrationStepNumber>
        <ProgressBarLine isDone={currentStep > 1} />
        <MigrationStepNumber style={{ backgroundColor: '#FFFFFF', color: '#34455A' }}>3</MigrationStepNumber>
      </UpperPartWrapper>
      <LowerPartWrapper>
        <StepTitle isActive={currentStep === 0}>Define Owner Address</StepTitle>
        <StepTitle isActive={currentStep === 1}>Migration file & KV Deletion</StepTitle>
        <StepTitle isActive={currentStep === 3}>Validator Registration</StepTitle>
      </LowerPartWrapper>
    </Wrapper>
    <FlowName>
      Step {currentStep + 1} from 3
    </FlowName>
  </Container>
);

export default MigrationStepsBar;
