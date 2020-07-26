import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Icon } from '../../../../../common/components';

const Wrapper = styled.div`
  width: 85%;
  display: flex;
`;

const Left = styled.div`
  width: 80%;
  display: flex;
  flex-direction: column;
`;

const AddressKey = styled.div`
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Date = styled.div`
  height: 20px;
  font-size: 12px;
  font-weight: 300;
  color: ${({ theme }) => theme.gray600};
`;

const Right = styled.div`
  width: 20%;
  padding-left: 1%;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const TestNet = styled.div`
  width: 50px;
  height: 20px;
  font-size: 11px;
  font-weight: 500;
  color: ${({ theme }) => theme.gray600};
  background-color: ${({ theme }) => theme.gray200};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 5px;
`;

const onCopy = () => {};

const KeyCell = ({ value }) => (
  <Wrapper>
    <Left>
      <AddressKey>{value.publicKey}</AddressKey>
      <Date>
        Created:
        {value.createdAt}
      </Date>
    </Left>
    <Right>
      <CopyToClipboard text={value.publicKey} onCopy={onCopy}>
        <Icon
          name="copy"
          color="gray800"
          fontSize="16px"
          onClick={() => false}
        />
      </CopyToClipboard>
      <TestNet>TestNet</TestNet>
    </Right>
  </Wrapper>
);

KeyCell.propTypes = {
  value: PropTypes.object,
};

export default KeyCell;
