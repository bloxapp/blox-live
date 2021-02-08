import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Wrapper = styled.div`
  width: ${({ width }) => width};
  height: ${({ height }) => height};
  margin-top: 34px;
  border-radius: 7px;
  position: relative;
  background-color: #ffffff;
  display: flex;
  flex-direction:${({direction}) => direction || 'row'};
  cursor: ${({ isDisabled }) => (isDisabled ? 'default' : 'pointer')};
  background-color: ${({ theme, isDisabled }) => isDisabled ? theme.gray5050 : '#ffffff'};
  opacity: ${({ isDisabled }) => (isDisabled ? 0.5 : 1)};
  box-shadow: ${({theme, border}) => border ? null : `1px 2px ${theme.gray300}`};
`;

const BorderPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  z-index: 2;
  border-radius: 7px;
  transition: all 0.5s;
  box-shadow: ${({ theme, isDisabled, border}) => border ? (isDisabled ? `${theme.gray600} inset 0px 0px 0px 1px`
      : `${theme.primary900} inset 0px 0px 0px 2px`) : null};
  &:hover {
    box-shadow: ${({ theme, isDisabled }) => isDisabled
     ? `${theme.gray600} inset 0px 0px 0px 1px`
     : `${theme.primary900} inset 0px 0px 0px 4px`};
  }
   &:active {
   opacity: 0.5;
   background-color: ${({theme}) => theme.primary050};
  }
`;

const Button = (props) => {
  const { width, height, onClick, isDisabled, children, direction, border, style } = props;
  return (
    <Wrapper
      style={style || {}}
      width={width}
      height={height}
      isDisabled={isDisabled}
      onClick={onClick}
      direction={direction}
      border={border}
    >
      <BorderPlaceholder style={{ margin: -(style.padding || 0) }} isDisabled={isDisabled} border={border} />
      {children}
    </Wrapper>
  );
};

Button.defaultProps = {
  isDisabled: false,
  border: true,
  width: '310px',
  height: '100px',
  style: {}
};

Button.propTypes = {
  width: PropTypes.string,
  height: PropTypes.string,
  onClick: PropTypes.func,
  isDisabled: PropTypes.bool,
  border: PropTypes.bool,
  direction: PropTypes.string,
  children: PropTypes.node,
  style: PropTypes.object
};

export default Button;
