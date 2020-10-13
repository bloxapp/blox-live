import React, { useEffect } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { notification } from 'antd';
import { shell } from 'electron';
import { InfoWithTooltip } from 'common/components';
import { INTRO_TOOLTIP_TEXT } from './constants';
import { Title, Paragraph, Link, BigButton } from '../../common';
import * as wizardActions from '../../../actions';
import * as selectors from '../../../selectors';

import { clearAccountsData, setDepositNeeded, } from '../../../../Accounts/actions';
import { getAccounts, getDepositNeededStatus, getDepositToPublicKey, getDepositToIndex } from '../../../../Accounts/selectors';

import { getData } from '../../../../ProcessRunner/selectors';

import { DepositData } from './components';
import { openExternalLink } from '../../../../common/service';
import config from 'backend/common/config';

import tipImage from 'assets/images/info.svg';

const Wrapper = styled.div`
  width:580px;
`;

const GoEthButton = styled.a`
  width:113px;
  height:28px;
  border-radius:6px;
  border:solid 1px ${({theme}) => theme.gray400};
  font-size: 11px;
  font-weight: 500;
  color:${({theme}) => theme.primary900};
  display:flex;
  align-items:center;
  justify-content:center;
  margin-top:12px;
  cursor:pointer;
`;

const ButtonsWrapper = styled.div`
  width:100%;
  margin-top:36px;
  display:flex;
  justify-content:space-between;
`;

const CancelButton = styled(BigButton)`
  color:${({theme}) => theme.gray600};
  background-color:transparent;
  border:1px solid ${({theme}) => theme.gray400};
`;

const Tip = styled.div`
  font-size: 12px;
  font-weight: 500;
  display:flex;
  align-items:center;
  margin-top:78px;
  margin-bottom:8px;
`;

const TipImage = styled.img`
  width:24px;
  height:24px;
  margin-right:7px;
`;

const StakingDeposit = (props: Props) => {
  const { setPage, page, depositData, accountsFromApi, actions, callClearAccountsData, accountDataFromProcess,
          isDepositNeeded, depositTo, callSetDepositNeeded, depositToIndex } = props;
  const { updateAccountStatus, clearWizardData, loadDepositData, setFinishedWizard } = actions;

  useEffect(() => {
    if (isDepositNeeded && depositTo) {
      loadDepositData(depositTo, depositToIndex);
      callSetDepositNeeded(false, depositTo, depositToIndex);
    }
  }, [isDepositNeeded, depositTo]);

  const onMadeDepositButtonClick = async () => {
    const accountFromApi: Record<string, any> = accountsFromApi.find((account) => account.publicKey === depositTo);
    const currentAccount = accountDataFromProcess || accountFromApi;
    if (currentAccount) {
      await updateAccountStatus(currentAccount.id);
      await callSetDepositNeeded(false, '', -1);
      await setPage(page + 1);
    }
    else {
      notification.error({message: 'Account not found'});
    }
  };

  const onDepositLaterButtonClick = async () => {
    await clearWizardData();
    await callClearAccountsData();
    await setFinishedWizard(true);
  };

  const onCopy = () => notification.success({message: 'Copied to clipboard!'});

  return (
    <Wrapper>
      <Title>TestNet Staking Deposit</Title>
      <Paragraph>
        To start staking on beacon chain Testnet, you are required to stake 32 GoETH
        <InfoWithTooltip title={INTRO_TOOLTIP_TEXT} placement="bottom" /> into the
        validator deposit contract.
        <GoEthButton onClick={() => shell.openExternal(config.env.DISCORD_GOETH_INVITE)}>
          Need GoETH?
        </GoEthButton>
      </Paragraph>

      {depositData && <DepositData depositData={depositData} onCopy={onCopy} />}
      <Tip><TipImage src={tipImage} />If your deposit transaction fails, try increasing the Gas Price and Gas Limit.</Tip>
      <Link onClick={() => openExternalLink('docs-guides/#pp-toc__heading-anchor-15')}>Need help?</Link>
      <ButtonsWrapper>
        <BigButton onClick={onMadeDepositButtonClick}>I&apos;ve Made the Deposit</BigButton>
        <CancelButton onClick={onDepositLaterButtonClick}>I&apos;ll Deposit Later</CancelButton>
      </ButtonsWrapper>
    </Wrapper>
  );
};

const mapStateToProps = (state: State) => ({
  depositData: selectors.getDepositData(state),
  accountDataFromProcess: getData(state),
  accountsFromApi: getAccounts(state),
  isDepositNeeded: getDepositNeededStatus(state),
  depositTo: getDepositToPublicKey(state),
  depositToIndex: getDepositToIndex(state),
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  actions: bindActionCreators(wizardActions, dispatch),
  callClearAccountsData: () => dispatch(clearAccountsData()),
  callSetDepositNeeded: (isNeeded, publicKey, accountIndex) => dispatch(setDepositNeeded(isNeeded, publicKey, accountIndex)),
});

type Props = {
  page: number;
  setPage: (page: number) => void;
  step: number;
  setStep: (page: number) => void;
  depositData: string;
  accountsFromApi: { publicKey: string, id: number }[];
  accountDataFromProcess: Record<string, any> | null;
  actions: Record<string, any> | null;
  callClearAccountsData: () => void;
  callSetDepositNeeded: (arg0: boolean, publicKey: string, index: number) => void;
  isDepositNeeded: boolean;
  depositTo: string;
  depositToIndex: number;
};

type State = Record<string, any>;
type Dispatch = (arg0: { type: string }) => any;

export default connect(mapStateToProps, mapDispatchToProps)(StakingDeposit);
