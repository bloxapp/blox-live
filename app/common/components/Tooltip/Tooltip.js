import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Tooltip from '@material-ui/core/Tooltip';

const StyledTooltip = styled((props) => (
  <Tooltip
    classes={{ popper: props.className, tooltip: 'tooltip' }}
    {...props}
  />
))`
  & .tooltip {
    background-color: ${({theme, bgColor}) => bgColor ? theme[bgColor] : theme.gray800};
    color: ${(props) => props.theme.gray50};
    padding: 10px;
    font-family: Avenir;
    font-size: 12px;
    font-weight: 500;
    & > span {
      color: ${({theme, bgColor}) => bgColor ? theme[bgColor] : theme.gray800}};
    }
  }
`;

const BloxTooltip = ({ children, ...rest }) => (
  <StyledTooltip {...rest} arrow>
    {children}
  </StyledTooltip>
);

BloxTooltip.propTypes = {
  title: PropTypes.any,
  children: PropTypes.node,
  placement: PropTypes.string,
  bgColor: PropTypes.string,
};

export default BloxTooltip;
