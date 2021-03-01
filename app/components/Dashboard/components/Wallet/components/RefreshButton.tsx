import React from 'react';
import styled from 'styled-components';
import { Icon } from '~app/common/components';
import useDashboardData from '~app/components/Dashboard/useDashboardData';

const Wrapper = styled.button`
  background-color:transparent;
  border:0;
  outline:none;
  cursor:pointer;
  display: inline-flex;
  align-items:center;
  padding:0;
  width: 100px;
  float: left;
  margin:1px 0 5px 0;
  height: 30px;
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
    <Wrapper onClick={() => loadDashboardData(true)}>
      <Icon name={'refresh'} fontSize={'13px'} color={'primary900'} />
      <Text>Refresh Data</Text>
    </Wrapper>
  );
};

export default RefreshButton;
