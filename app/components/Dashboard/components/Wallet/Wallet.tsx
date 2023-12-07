import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
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
  const { isActive, isNeedUpdate, summary, version, showNetworkSwitcher, shouldShowInactiveWarning = true, ...rest } = props;
  return (
    <Wrapper>
      <UpdateBanner isNeedUpdate={isNeedUpdate} />
      {summary && (
        <TopPart>
          {shouldShowInactiveWarning && <RefreshButton />}
          { showNetworkSwitcher && <NetworkSwitcher />}
        </TopPart>
      )}
      {shouldShowInactiveWarning && <StatusBar isActive={isActive} />}
      <Boxes bloxLiveNeedsUpdate={isNeedUpdate} isActive={isActive} summary={summary} walletVersion={version} shouldShowInactiveWarning={shouldShowInactiveWarning} {...rest} />
    </Wrapper>
  );
};

Wallet.propTypes = {
  isActive: PropTypes.bool,
  isNeedUpdate: PropTypes.bool,
  walletNeedsUpdate: PropTypes.bool,
  showNetworkSwitcher: PropTypes.bool,
  summary: PropTypes.object,
  version: PropTypes.string,
  shouldShowInactiveWarning: PropTypes.bool
};

export default Wallet;
