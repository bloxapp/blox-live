import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Table } from 'common/components';
import tableColumns from './tableColumns';

const Wrapper = styled.div`
  width: 100%;
`;

const Title = styled.h1`
  font-size: 26px;
  font-weight: 500;
  line-height: 1.69;
  color: ${({ theme }) => theme.gray800};
`;

const Validators = ({ accounts }) => (
  <Wrapper>
    <Title>Validators</Title>
    <Table columns={tableColumns} isLoading={false} data={accounts} />
  </Wrapper>
);

Validators.propTypes = {
  accounts: PropTypes.array,
};

export default Validators;
