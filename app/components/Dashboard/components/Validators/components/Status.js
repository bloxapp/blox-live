import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { STATUSES } from '../../../constants';

const Wrapper = styled.div`
  width: 80px;
  height: 30px;
  padding-right: 12px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 300;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  text-transform: capitalize;
  color: #ffffff;
  background-color: ${({ theme, color }) => theme[color]};
`;

const Status = ({ status }) => (
  <Wrapper color={STATUSES[status].color}>{STATUSES[status].name}</Wrapper>
);

Status.propTypes = {
  status: PropTypes.string,
};

export default Status;
