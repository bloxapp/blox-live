import React from 'react';
import styled from 'styled-components';
import CircularProgress from '@material-ui/core/CircularProgress';
import CheckIcon from '@material-ui/icons/Check';

const ButtonStyled = styled.button`
  padding: 8px 12px;
  border: none;
  cursor: pointer;
  background-color: #2536B8;
  color: white;
  &:hover {
    background-color: #2546b2;
  }
  &:disabled {
    cursor: default;
    background-color: lightgrey;
  }
`;

const DownloadButton = ({ state, onClick }) => {
  if (state === 'inProgress') {
    return (
      <ButtonStyled onClick={onClick}>
        <CircularProgress size={24} style={{ color: 'white' }} />
      </ButtonStyled>
    );
  } else if (state === 'completed') {
    return (
      <ButtonStyled disabled>
        <CheckIcon style={{ color: 'white', marginRight: '8px' }} /> Downloaded
      </ButtonStyled>
    );
  } else {
    return <ButtonStyled onClick={onClick}>Download</ButtonStyled>;
  }
};

export default DownloadButton;
