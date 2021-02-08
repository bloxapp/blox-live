import React from 'react';
import Content from './wrappers/Content';
import Header from '../../common/Header';
import SettingsPage from '../../SettingsPage';

const SettingsRoute = ({ renderProps }: SettingsRouteProps) => {
  return (
    <>
      <Header withMenu isDashboard={false} />
      <Content>
        <SettingsPage withMenu {...renderProps} />
      </Content>
    </>
  );
};

type SettingsRouteProps = {
  renderProps: any;
};

export default SettingsRoute;
