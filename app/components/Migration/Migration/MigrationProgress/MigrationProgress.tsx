import React from 'react';
import styled from 'styled-components';
import {MigrationStepNumber} from '~app/components/Migration/styles';

const Container = styled.div`
  width: 100%;
  height: 80px;
  display: flex;
  justify-content: space-between;
  padding: 30px 0 30px 0;
`;

const FlowName = styled.p`
  color: var(--gray-5, #63768B);
  font-variant-numeric: lining-nums proportional-nums;
  font-feature-settings: 'clig' off, 'liga' off;
  font-family: Avenir;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 22px;`;

const ProgressBarWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const ProgressBarLine = styled.div`
  width: 180px;
  height: 2px;
  margin-bottom: 9px;
  background-color: #97A5BA;
  position: relative;
  right: 67px;
`;

const ProgressBarFirstLine = styled.div`
  width: 180px;
  height: 2px;
  margin-bottom: 9px;
  background-color: #97A5BA;
  position: relative;
  left: 70px;
`;

const MigrationStepWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 30px;
  position: relative;
`;

const MigrationThirdStepWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 30px;
  position: relative;
  right: 130px;
`;

const MigrationFirstStepWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 30px;
  position: relative;
  left: 123px;
`;

const StepTitle = styled.p`
  color: #63768B;
  font-variant-numeric: lining-nums proportional-nums;
  font-feature-settings: 'clig' off, 'liga' off;
  font-family: Avenir;
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  line-height: 16px;
`;

const MigrationProgress = ({currentStep}: {currentStep: number}) => (
  <Container>
    <FlowName>
      ssv.network migration
    </FlowName>
    <ProgressBarWrapper>
      <MigrationFirstStepWrapper>
        <MigrationStepNumber style={currentStep < 0 ? {borderColor: '#97A5BA'} : null}>1</MigrationStepNumber>
        <StepTitle style={currentStep >= 0 ? {color: '#1BA5F8'} : null}>Define Owner Address</StepTitle>
      </MigrationFirstStepWrapper>
      <ProgressBarFirstLine style={currentStep > 0 ? {backgroundColor: '#1BA5F8'} : null} />
      <MigrationStepWrapper>
        <MigrationStepNumber style={currentStep < 1 ? {borderColor: '#97A5BA'} : null}>2</MigrationStepNumber>
        <StepTitle style={currentStep >= 1 ? {color: '#1BA5F8'} : null}>Migration file & KV Deletion</StepTitle>
      </MigrationStepWrapper>
      <ProgressBarLine style={currentStep > 1 ? {backgroundColor: '#1BA5F8'} : null} />
      <MigrationThirdStepWrapper>
        <MigrationStepNumber style={currentStep < 2 ? {borderColor: '#97A5BA'} : null}>3</MigrationStepNumber>
        <StepTitle>Validator Registration</StepTitle>
      </MigrationThirdStepWrapper>
    </ProgressBarWrapper>
    <FlowName>
      Step {currentStep + 1} from 3
    </FlowName>
  </Container>
  );

export default MigrationProgress;
