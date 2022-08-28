import React from 'react';
import styled from 'styled-components';
import { CircularProgress } from '@material-ui/core';

const Spinner = styled((props) => (
  <CircularProgress
    classes={{ spinner: props.classes, indeterminate: 'spinner' }}
    {...props}
  />
))`
  &.spinner {
    width: ${(props) => `${props.width} !important` || '8px !important'};
    height: ${(props) => props.height ? `${props.height} !important` : 'auto !important'};
    .MuiLinearProgress-barColorPrimary {
      background-color: ${(props) => props.theme.primary900};
    }
  }
`;

export default Spinner;
