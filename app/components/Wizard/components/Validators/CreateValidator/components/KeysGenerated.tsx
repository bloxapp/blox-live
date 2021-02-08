import React from 'react';
import {connect} from 'react-redux';
import styled from 'styled-components';
import { bindActionCreators } from 'redux';
import { NETWORKS } from '../../constants';
import { InfoWithTooltip } from 'common/components';
import * as actionsFromWizard from '../../../../actions';
import useDashboardData from '../../../../../Dashboard/useDashboardData';
import { Title, SubTitle, Paragraph, BigButton, SuccessIcon } from '../../../common';

const Wrapper = styled.div``;

const KeyWrapper = styled.div`
  width: 546px;
  border-radius: 8px;
  color: ${({theme}) => theme.gray600};
  font-size: 11px;
  font-weight: 500;
  border: solid 1px ${({theme}) => theme.gray300};
  background-color: ${({theme}) => theme.gray100};
  display:flex;
  align-items:center;
  padding:16px;
  margin-bottom:16px;
`;

const SmallText = styled.div`
  margin:16px 0 24px 0;
  font-size:12px;
`;

let publicKeyTooltip = 'The public (signing) key is used for signing the validator’s on-chain duties,';
publicKeyTooltip += 'including proposing blocks and attesting to others. The validator public key must be online for signing 24/7.';
let withdrawalKeyTooltip = 'The withdrawal public key is used to incorporate data into an Ethereum staking deposit,';
withdrawalKeyTooltip += 'which will later be used for identifying the entity that is allowed to withdraw Ether using the Withdrawal Private Key.';

const KeysGenerated = (props: Props) => {
  const { onClick, validatorData, wizardActions } = props;
  const { setFinishedWizard, clearWizardData } = wizardActions;
  const { loadDashboardData } = useDashboardData();

  const onGoToDashboardClick = async () => {
    await clearWizardData();
    await setFinishedWizard(true);
    await loadDashboardData();
  };

  return (
    <Wrapper>
      <SuccessIcon />
      <Title color="accent2400">Your Keys Were Created!</Title>
      <Paragraph>
        Your new {NETWORKS[validatorData.network].name} validator keys were created and are now secured inside <br />
        your KeyVault. Validator will be visible on Etherscan only after deposit.
      </Paragraph>
      <SubTitle>
        Public Key
        <InfoWithTooltip title={publicKeyTooltip} placement="top" />
      </SubTitle>
      <KeyWrapper>{validatorData.publicKey}</KeyWrapper>
      <SubTitle>
        Withdrawal Key
        <InfoWithTooltip title={withdrawalKeyTooltip} placement="top" />
      </SubTitle>
      <KeyWrapper>{validatorData.withdrawalKey}</KeyWrapper>
      <SmallText>
        You can later export your validator keys.
      </SmallText>

      {!validatorData.deposited && (
        <BigButton onClick={onClick}>
          Continue to Staking Deposit
        </BigButton>
      )}

      {validatorData.deposited && (
        <BigButton onClick={onGoToDashboardClick}>
          Continue to Dashboard
        </BigButton>
      )}
    </Wrapper>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  wizardActions: bindActionCreators(actionsFromWizard, dispatch)
});

type Props = {
  onClick: () => void;
  validatorData: Record<string, any>;
  wizardActions: Record<string, any>;
};

type Dispatch = (arg0: { type: string }) => any;

export default connect(null, mapDispatchToProps)(KeysGenerated);
