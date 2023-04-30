import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import * as dashboardSelectors from '~app/components/Dashboard/selectors';
import NetworkSwitcher from '~app/components/Dashboard/components/NetworkSwitcher';
import UpdateBanner from '~app/components/Dashboard/components/Wallet/components/UpdateBanner';
import { Boxes, StatusBar, RefreshButton } from '~app/components/Dashboard/components/Wallet/components';

const Wrapper = styled.div`
  width: 100%;
  height: auto;
  margin-bottom:36px;
`;

const TopPart = styled.div`
  width:100%;
  margin-top: 50px;
`;

const Wallet = (props) => {
  const { isActive, isNeedUpdate, summary, version, features, ...rest } = props;
  return (
    <Wrapper>
      <UpdateBanner isNeedUpdate={isNeedUpdate} />
      {summary && (
        <TopPart>
          <RefreshButton />
          { features.showNetworkSwitcher && <NetworkSwitcher />}
        </TopPart>
      )}
      <StatusBar isActive={isActive} />
      <Boxes bloxLiveNeedsUpdate={isNeedUpdate} isActive={isActive} summary={summary} walletVersion={version} {...rest} />
    </Wrapper>
  );
};

Wallet.propTypes = {
  features: PropTypes.object,
  isActive: PropTypes.bool,
  isNeedUpdate: PropTypes.bool,
  walletNeedsUpdate: PropTypes.bool,
  summary: PropTypes.object,
  version: PropTypes.string
};

const mapStateToProps = (state) => ({
  features: dashboardSelectors.getFeatures(state),
});

export default connect(mapStateToProps)(Wallet);
