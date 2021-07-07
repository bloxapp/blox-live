import React from 'react';
import { shell } from 'electron';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { notification } from 'antd';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Icon } from '~app/common/components';
import { truncateText } from '~app/components/common/service';
import { Link } from '~app/components/Wizard/components/common';
import { NETWORKS } from '~app/components/Wizard/components/Validators/constants';
import {
  AddressKey,
  AdditionalData,
  AdditionalDataWrapper,
  Left,
  Right,
  TestNet
} from '~app/components/Dashboard/components/Validators/components/KeyCell/components';

const Wrapper = styled.div`
  width: 90%;
  display: flex;
`;

const onCopy = () => notification.success({message: 'Copied to clipboard!'});

const getNetworkLink = (network: string, publicKey: string): string => {
  switch (network) {
    default:
    case NETWORKS.mainnet.label:
      return `https://beaconcha.in/validator/${publicKey}`;
    case NETWORKS.prater.label:
      return `https://prater.beaconcha.in/validator/${publicKey}`;
  }
};

const KeyCell = ({ value }) => {
  const { publicKey, createdAt, status, accountIndex, network } = value;
  const beaconchaLinkStyle = { color: '#7c8087', textDecoration: 'underline' };

  return (
    <Wrapper>
      <Left>
        <AddressKey>
          <Link
            style={beaconchaLinkStyle}
            onClick={() => shell.openExternal(getNetworkLink(network, publicKey))}
          >
            {truncateText(publicKey, 24, 6)}
          </Link>
        </AddressKey>
        <AdditionalDataWrapper>
          <AdditionalData
            publicKey={publicKey}
            status={status}
            createdAt={createdAt}
            accountIndex={accountIndex}
            network={network}
          />
        </AdditionalDataWrapper>
      </Left>
      <Right>
        <CopyToClipboard text={publicKey} onCopy={onCopy}>
          <Icon name="copy" color="gray800" fontSize="16px" onClick={() => false} />
        </CopyToClipboard>
        {network === NETWORKS.prater.label && <TestNet>Prater Testnet</TestNet>}
        {network === NETWORKS.mainnet.label && <TestNet>MainNet</TestNet>}
      </Right>
    </Wrapper>
  );
};

KeyCell.propTypes = {
  value: PropTypes.object,
};

export default KeyCell;
