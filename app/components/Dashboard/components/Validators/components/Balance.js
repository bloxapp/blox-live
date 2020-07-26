import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Wrapper = styled.div``;

const Balance = ({ balance }) => (
  <Wrapper>{balance !== null ? `${balance} ETH` : 'N/A'}</Wrapper>
);

Balance.propTypes = {
  balance: PropTypes.string,
};

export default Balance;
