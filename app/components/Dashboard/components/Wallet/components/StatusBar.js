import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Wrapper = styled.div`
  width: 100%;
  height: 44px;
  padding: 0px 16px;
  display: flex;
  align-items: center;
  background-color: ${({ theme, isActive }) =>
    isActive ? theme.accent2400 : theme.destructive600};
  color: ${({ theme }) => theme.gray50};
  font-size: 14px;
  font-weight: 900;
  border-radius: 4px;
  margin-bottom: 28px;
`;

const StatusBar = (props) => {
  const { isActive } = props;
  return (
    <Wrapper isActive={isActive}>
      {isActive ? 'All System Operational' : 'KeyVault Inactive'}
    </Wrapper>
  );
};

StatusBar.propTypes = {
  isActive: PropTypes.bool,
};

export default StatusBar;
