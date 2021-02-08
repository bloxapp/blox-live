import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import UpdateBanner from './components/UpdateBanner';
import { Boxes, StatusBar, RefreshButton } from './components';

const Wrapper = styled.div`
  width: 100%;
  height: auto;
  margin-bottom:36px;
`;

const TopPart = styled.div`
  width:100%;
  display:flex;
  align-items:flex-start;
`;

const Wallet = (props) => {
  const { isActive, isNeedUpdate, summary, ...rest } = props;
  return (
    <Wrapper>
      <UpdateBanner isNeedUpdate={isNeedUpdate} />
      {summary && (
        <TopPart>
          <RefreshButton />
        </TopPart>
      )}
      <StatusBar isActive={isActive} />
      <Boxes isActive={isActive} summary={summary} {...rest} />
    </Wrapper>
  );
};

Wallet.propTypes = {
  isActive: PropTypes.bool,
  isNeedUpdate: PropTypes.bool,
  summary: PropTypes.object,
};

export default Wallet;
