import React, { useEffect } from 'react';
import {connect} from 'react-redux';
import styled from 'styled-components';
import { bindActionCreators } from 'redux';
import config from '~app/backend/common/config';
import useRouting from '~app/common/hooks/useRouting';
import { InfoWithTooltip } from '~app/common/components';
import * as actionsFromWizard from '~app/components/Wizard/actions';
import useDashboardData from '~app/components/Dashboard/useDashboardData';
import { NETWORKS } from '~app/components/Wizard/components/Validators/constants';
import useNetworkSwitcher from '~app/components/Dashboard/components/NetworkSwitcher/useNetworkSwitcher';
import { Title, SubTitle, Paragraph, BigButton, SuccessIcon } from '~app/components/Wizard/components/common';

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

let publicKeyTooltip = 'The public (signing) key is used for signing the validator’s on-chain duties,';
publicKeyTooltip += 'including proposing blocks and attesting to others. The validator public key must be online for signing 24/7.';

const KeysGenerated = (props: Props) => {
  const { onClick, validatorData, wizardActions, depositData, setPageData } = props;
  const { setFinishedWizard, clearWizardData } = wizardActions;
  const { loadDataAfterNewAccount } = useDashboardData();
  const { setTestNetShowFlag } = useNetworkSwitcher();
  const { goToPage, ROUTES } = useRouting();

  const onGoToDashboardClick = async () => {
    await clearWizardData();
    await setFinishedWizard(true);
    // Reload accounts from API before coming to dash
    await loadDataAfterNewAccount().then(() => {
      goToPage(ROUTES.DASHBOARD);
    });
  };

  useEffect(() => {
    setTestNetShowFlag(validatorData.network === config.env.PRATER_NETWORK);
    setPageData({
      newValidatorDeposited: validatorData.deposited
    });
  }, [validatorData]);

  return (
    <>
      <SuccessIcon />
      <Title color="accent2400" style={{ marginTop: 30 }}>Your Keys Were Created!</Title>
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
        Withdrawal Credentials
      </SubTitle>
      <KeyWrapper>{depositData.withdrawalCredentials}</KeyWrapper>

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
    </>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  wizardActions: bindActionCreators(actionsFromWizard, dispatch)
});

type Props = {
  onClick: () => void;
  validatorData: Record<string, any>;
  wizardActions: Record<string, any>;
  depositData: Record<string, any>;
  setPageData: (data: any) => void;
};

type Dispatch = (arg0: { type: string }) => any;

export default connect(null, mapDispatchToProps)(KeysGenerated);
