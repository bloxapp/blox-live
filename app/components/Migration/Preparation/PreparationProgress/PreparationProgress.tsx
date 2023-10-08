import React from 'react';
import styled from 'styled-components';
import {Title} from '~app/components/Migration/styles';

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
  padding: 0 0px 0 20px;
`;

const Line = styled.div`
  width: 252px;
  height: 4px;
  background-color: #CBD3E5;
  margin-right: 8px;
`;

const PreparationProgress = ({currentStep}: {currentStep: number}) => {
  const components = [Line, Line, Line];
  return (
    <PreparationWrapper>
      <Title>SSV Migration Preparation</Title>
      <Lines>
        {components.map((Component : any, index: number) => <Component key={index} style={currentStep >= index ? {backgroundColor: '#1BA5F8'} : null} />)}
      </Lines>
    </PreparationWrapper>
  );
};

export default PreparationProgress;
