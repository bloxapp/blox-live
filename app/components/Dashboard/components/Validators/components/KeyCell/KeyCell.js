import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { notification } from 'antd';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Icon } from 'common/components';
import { AddressKey, AdditionalData, AdditionalDataWrapper, Left, Right, TestNet } from './components';
import { truncateText } from '../../../../../common/service';

const Wrapper = styled.div`
  width: 90%;
  display: flex;
`;

const onCopy = () => notification.success({message: 'Copied to clipboard!'});

const KeyCell = ({ value }) => {
  const { publicKey, createdAt, status, accountIndex } = value;
  return (
    <Wrapper>
      <Left>
        <AddressKey>{truncateText(publicKey, 24, 6)}</AddressKey>
        <AdditionalDataWrapper>
          <AdditionalData publicKey={publicKey} status={status} createdAt={createdAt} accountIndex={accountIndex} />
        </AdditionalDataWrapper>
      </Left>
      <Right>
        <CopyToClipboard text={publicKey} onCopy={onCopy}>
          <Icon name="copy" color="gray800" fontSize="16px" onClick={() => false} />
        </CopyToClipboard>
        <TestNet>TestNet</TestNet>
      </Right>
    </Wrapper>
  );
};

KeyCell.propTypes = {
  value: PropTypes.object,
};

export default KeyCell;
