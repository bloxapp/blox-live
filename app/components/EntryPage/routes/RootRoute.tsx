import React from 'react';
import styled from 'styled-components';
import Wizard from '../../Wizard';
import Dashboard from '../../Dashboard';
import Content from './wrappers/Content';
import Header from '../../common/Header';

const DashboardWrapper = styled.div`
  width: 100%;
  min-height:100%;
  padding-top: 70px;
  background-color: #f7fcff;
`;

const WizardWrapper = styled.div`
  width: 100%;
  min-height:100%;
  background-color: #f7fcff;
  display: grid;
`;

const RootRoute = ({ showDashboard, showWizard, renderProps }: RootRouteProps) => {
  return (
    <>
      {showDashboard && (
        <>
          <Header withMenu isDashboard={showDashboard} />
          <Content>
            <DashboardWrapper>
              <Dashboard {...renderProps} />
            </DashboardWrapper>
          </Content>
        </>
      )}
      {showWizard && (
        <WizardWrapper>
          <Wizard {...renderProps} />
        </WizardWrapper>
      )}
    </>
  );
};

type RootRouteProps = {
  showDashboard: boolean;
  showWizard: boolean;
  renderProps: any;
};

export default RootRoute;
