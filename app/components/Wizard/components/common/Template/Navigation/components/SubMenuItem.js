import React from 'react';
import styled, { keyframes } from 'styled-components';
import PropTypes from 'prop-types';
import { Icon } from 'common/components';

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  font-size: 12px;
  padding-top: 26px;
  position: relative;
  &:after {
    content: '';
    position: absolute;
    width: 1px;
    height: 19px;
    background-color: ${({ theme }) => theme.gray80015};
    top: 3px;
    left: 11px;
    display: ${({ showHorizontalLine }) => showHorizontalLine ? 'block' : 'none'};
  }
`;

const circleAnimation = keyframes`
  0% {
    opacity:0;
  }
  100% {
    opacity:1;
  }
`;

const Circle = styled.div`
  width: 16px;
  height: 16px;
  margin-right: 16px;
  margin-left: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  border: 1px solid ${({ theme }) => theme.gray400};
  border-radius: 50%;
  font-weight: 500;
  position: relative;
  &:after {
    content: '';
    position: absolute;
    width: 10px;
    height: 10px;
    background-color: ${({ theme, isActive }) => isActive ? theme.primary900 : 'transparent'};
    top: 2px;
    left: 2px;
    border-radius: 50%;
    animation: ${circleAnimation} 1s;
  }
`;

const Text = styled.span`
  color:${({isActive, isDone, theme}) => {
    if (isDone) { return theme.gray400; }
    if (isActive) { return theme.primary900; }
    return theme.gray800;
  }};
  font-weight: ${({isActive}) => isActive ? '400' : '300'};
`;

const SubMenuItem = ({ text, isActive, isDone, showLine }) => {
  return (
    <Wrapper showHorizontalLine={showLine}>
      <Circle isActive={isActive} isDone={isDone}>
        {isDone && <Icon name="check" color="gray400" />}
      </Circle>
      <Text isDone={isDone} isActive={isActive}>{text}</Text>
    </Wrapper>
  );
};

SubMenuItem.propTypes = {
  text: PropTypes.string,
  isActive: PropTypes.bool,
  isDone: PropTypes.bool,
  showLine: PropTypes.bool,
};

export default SubMenuItem;
