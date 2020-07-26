import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const getChangeColor = (change, theme) => {
  if (Number.isInteger(change)) {
    if (change > 0) {
      return theme.plgreen;
    }
    if (change < 0) {
      return theme.plred;
    }
    return theme.gray800;
  }
  return theme.gray800;
};

const Wrapper = styled.div`
  color: ${({ change, theme }) => getChangeColor(change, theme)};
`;

const Change = ({ change }) => (
  <Wrapper change={change}>{change !== null ? `${change} ETH` : 'N/A'}</Wrapper>
);

Change.propTypes = {
  change: PropTypes.string,
};

export default Change;
