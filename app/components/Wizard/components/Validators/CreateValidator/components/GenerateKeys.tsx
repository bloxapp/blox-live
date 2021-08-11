import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { NETWORKS } from '../../constants';
import { getWallet } from '../../../../selectors';
import { Spinner, Checkbox } from 'common/components';
import config from '../../../../../../backend/common/config';
import { openExternalLink } from '../../../../../common/service';
import { Title, Paragraph, BigButton, Link, ErrorMessage } from '../../../common';
import Connection from '../../../../../../backend/common/store-manager/connection';

const Wrapper = styled.div``;

const ButtonWrapper = styled.div`
  margin-bottom: 12px;
`;

const LoaderWrapper = styled.div`
  max-width:500px;
  display:flex;
`;

const LoaderText = styled.span`
  margin-left: 11px;
  font-size: 12px;
  color: ${({ theme }) => theme.primary900};
`;

const GenerateKeys = (props: Props) => {
  const checkboxStyle = { marginRight: 5 };
  const checkboxLabelStyle = { fontSize: 12 };
  const { isLoading, onClick, error, network, wallet } = props;
  const [checkedAwarenessCheckbox, setAwarenessCheckboxChecked] = useState(false);
  const isWalletImported = wallet && wallet.imported;
  const showCheckbox = (
      // The checkbox should appear when the wallet is imported and network is not prater.
      isWalletImported && network !== config.env.PRATER_NETWORK
    ) || (
      // Or when import feature network is prater and current selected network is prater too.
      Connection.db().get('feature:import:network') === config.env.PRATER_NETWORK
      && isWalletImported && network === config.env.PRATER_NETWORK
    );
  const [isButtonDisabled, setButtonDisabled] = useState(showCheckbox);

  useEffect(() => {
    setButtonDisabled(showCheckbox ? (isLoading || !checkedAwarenessCheckbox) : isLoading);
  }, [isLoading, checkedAwarenessCheckbox, showCheckbox]);

  if (network) {
    return (
      <Wrapper>
        <Title>Create {NETWORKS[network].name} Validator</Title>
        <Paragraph>
          Now we must generate your secure validator keys to begin creating your{' '}
          <br />
          {NETWORKS[network].name} validator. These keys will be generated securely using KeyVault.{' '}
          <br />
          <Link onClick={() => openExternalLink('knowledge-base/guides/validator/what-are-eth2-keys/#validator-key')}>What is a validator key?</Link>
        </Paragraph>

        {showCheckbox && (
          <>
            <Checkbox
              disabled={isLoading}
              checkboxStyle={checkboxStyle}
              labelStyle={checkboxLabelStyle}
              checked={checkedAwarenessCheckbox}
              onClick={() => { setAwarenessCheckboxChecked(!checkedAwarenessCheckbox); }}
            >
              I&apos;m aware that before importing, to avoid slashing risks, my validator needs to be offline
            </Checkbox>
            <br />
          </>
        )}

        <ButtonWrapper>
          <BigButton isDisabled={isButtonDisabled} onClick={() => { !isButtonDisabled && onClick(); }}>
            Generate Validator Keys
          </BigButton>
        </ButtonWrapper>

        {isLoading && (
          <LoaderWrapper>
            <Spinner width="17px" />
            <LoaderText>Generating Validator Keys...</LoaderText>
          </LoaderWrapper>
        )}

        {error && (
          <ErrorMessage>
            {error}, please try again.
          </ErrorMessage>
        )}
      </Wrapper>
    );
  }
  return null;
};

type Props = {
  isLoading: boolean;
  onClick: () => void;
  error: string;
  network: string,
  wallet: Record<string, any>
};

const mapStateToProps = (state) => ({
  wallet: getWallet(state)
});

export default connect(mapStateToProps, null)(GenerateKeys);
