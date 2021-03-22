import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import MenuItemCircle from './MenuItemCircle';

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  font-size: 14px;
  align-items:center;
`;

const Text = styled.div`
  color: ${({ isActive, theme }) => isActive ? theme.primary900 : theme.gray80015};
`;

const MenuItem = ({ text, stepNumber, isActive, isDone, hideNumber }) => {
  return (
    <Wrapper>
      <MenuItemCircle number={stepNumber} hideNumber={hideNumber} isActive={isActive} isDone={isDone} />
      <Text isActive={isActive} isDone={isDone}>{text}</Text>
    </Wrapper>
  );
};

MenuItem.propTypes = {
  isDone: PropTypes.bool,
  isActive: PropTypes.bool,
  text: PropTypes.string,
  stepNumber: PropTypes.number,
  hideNumber: PropTypes.bool,
};

export default MenuItem;
