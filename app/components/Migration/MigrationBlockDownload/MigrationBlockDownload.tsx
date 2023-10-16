import React, { useState } from 'react';
import styled from 'styled-components';
import CircularProgress from '@material-ui/core/CircularProgress';
import CheckIcon from '@material-ui/icons/Check';
import LockIcon from '@material-ui/icons/Lock';

const BlockWrapper = styled.div`
  background-color: var(--gray-1, #F4F7FA);
  width: 756px;
  padding: 16px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const ContentWrapper = styled.div`
  flex: 1; // This will make it take up all available vertical space
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end; // Aligns the button to the right
  margin-top: 16px; // Adds a bit of spacing between the text and the button
`;

const Title = styled.div`
  color:  #0792E8;
  font-feature-settings: 'clig' off, 'liga' off;
  font-size: 14px;
  font-style: normal;
  font-weight: 800;
  line-height: 162%;
  margin-bottom: 8px;
`;

const Text = styled.div`
  color: #34455A;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 162%;
`;

const ButtonStyled = styled.button`
  padding: 8px 16px;
  border: 1px solid #2536B8;
  border-radius: 24px;
  cursor: pointer;
  background-color: white;
  color: #2536B8;
  display: flex;
  align-items: center;
  &:hover {
    background-color: #f0f4f8;
  }
  &:disabled {
    cursor: default;
    background-color: #f0f4f8;
  }
`;

const IconContainer = styled.div`
  margin-right: 8px;
`;

const MigrationBlockDownload = ({ title, text, downloadState, onDownloadClick }) => {
  let buttonContent;
  let isButtonDisabled = false;

  switch (downloadState) {
    case 'inProgress':
      buttonContent = (
        <>
          <IconContainer>
            <CircularProgress size={24} style={{ color: '#2536B8' }} />
          </IconContainer>
          Downloading...
        </>
      );
      isButtonDisabled = true;
      break;
    case 'completed':
      buttonContent = (
        <>
          <IconContainer>
            <CheckIcon style={{ color: '#2536B8' }} />
          </IconContainer>
          Downloaded
        </>
      );
      isButtonDisabled = true;
      break;
    default:
      buttonContent = (
        <>
          <IconContainer>
            <LockIcon style={{ color: '#2536B8' }} />
          </IconContainer>
          Download
        </>
      );
  }

  return (
    <BlockWrapper>
      <ContentWrapper>
        <Title>{title}</Title>
        <Text>{text}</Text>
      </ContentWrapper>
      <ButtonWrapper>
        <ButtonStyled onClick={onDownloadClick} disabled={isButtonDisabled}>{buttonContent}</ButtonStyled>
      </ButtonWrapper>
    </BlockWrapper>
  );
};

export default MigrationBlockDownload;
