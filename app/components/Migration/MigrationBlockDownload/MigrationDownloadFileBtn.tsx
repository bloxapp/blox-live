import React from 'react';
import styled from 'styled-components';
import CircularProgress from '@material-ui/core/CircularProgress';
import CheckIcon from '@material-ui/icons/Check';
import LockIcon from '@material-ui/icons/Lock';

import { STATUSES } from '~app/components/Migration/interfaces';

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end; // Aligns the button to the right
  margin-top: 16px; // Adds a bit of spacing between the text and the button
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

const MigrationDownloadFileBtn = ({ downloadState, onDownloadClick }: { downloadState: STATUSES; onDownloadClick: () => void }) => {
  let btnContent = <LockIcon style={{ color: '#2536B8' }} />;
  let btnText = 'Download';

  if (downloadState === STATUSES.IN_PROGRESS) {
    btnContent = <CircularProgress size={24} style={{ color: '#2536B8' }} />;
    btnText = 'Downloading...';
  } else if (downloadState === STATUSES.COMPLETE) {
    btnContent = <CheckIcon style={{ color: '#2536B8' }} />;
    btnText = 'Downloaded';
  }

  return (
    <ButtonWrapper>
      <ButtonStyled onClick={onDownloadClick} disabled={downloadState === STATUSES.IN_PROGRESS}>
        <IconContainer>
          {btnContent}
        </IconContainer>
        {btnText}
      </ButtonStyled>
    </ButtonWrapper>
  );
};

export default MigrationDownloadFileBtn;
