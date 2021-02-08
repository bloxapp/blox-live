import React from 'react';
import styled from 'styled-components';
import { Icon } from 'common/components';
import useDashboardData from '../../../useDashboardData';

const Wrapper = styled.button`
  background-color:transparent;
  border:0;
  outline:none;
  cursor:pointer;
  display:flex;
  align-items:center;
  padding:0;
  margin:1px 0 5px 0;
`;

const Text = styled.span`
  margin:1px 0 0 4px;
  font-size: 11px;
  font-weight: 900;
  color: ${({theme}) => theme.primary900};
`;

const RefreshButton = () => {
  const { loadDashboardData } = useDashboardData();
  return (
    <Wrapper onClick={() => loadDashboardData()}>
      <Icon name={'refresh'} fontSize={'13px'} color={'primary900'} />
      <Text>Refresh Data</Text>
    </Wrapper>
  );
};

export default RefreshButton;
