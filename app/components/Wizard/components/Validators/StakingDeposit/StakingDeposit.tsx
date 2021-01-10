import React, {useEffect} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import styled from 'styled-components';
import {notification} from 'antd';
import {NETWORKS} from '../constants';
import {Title, BigButton} from '../../common';
import * as wizardActions from '../../../actions';
import * as selectors from '../../../selectors';

import {clearAccountsData, setDepositNeeded, setAddAnotherAccount} from '../../../../Accounts/actions';
import {
  getAccounts, getDepositNeededStatus, getDepositToPublicKey,
  getDepositToIndex, getDepositToNetwork
} from '../../../../Accounts/selectors';

import {getData} from '../../../../ProcessRunner/selectors';

import {MainNetText, TestNetText} from './components';

import theme from '../../../../../theme';
import MoveToBrowserModal from './components/MoveToBrowserModal';
import {openExternalLink} from '../../../../common/service';
import config from '../../../../../backend/common/config';
import {deepLink, cleanDeepLink} from '../../../../App/service';
import {getIdToken} from '../../../../CallbackPage/selectors';

const Wrapper = styled.div`
  width:580px;
`;

const SubTitle = styled.div`
  font-size: 16px;
  font-weight: 28px;
  color: ${theme.gray800};
  margin-top: 24px;
`;

const SmallText = styled.div`
  font-size: 12px;
  font-weight: 500px;
  color: ${theme.gray600};
  margin-top: 12px;
`;

const ButtonsWrapper = styled.div`
  width:270px;
  margin-top:12px;
  // align-items: center;
  text-align: center;
`;

const LaterBtn = styled.span`
    // width: 100%;
    font-size: 16px;
    font-weight: 900;
    cursor:pointer;
    display: inline-block;
    margin-top:10px;
    color: ${({theme, color}) => theme[color] || theme.primary900};
`;

const StakingDeposit = (props: Props) => {
  const {
    setPage, page, depositData, accountsFromApi, actions, callSetAddAnotherAccount, accountDataFromProcess,
    isDepositNeeded, publicKey, callSetDepositNeeded, callClearAccountsData, accountIndex, network, idToken
  } = props;
  const {updateAccountStatus, loadDepositData, setFinishedWizard, clearWizardData} = actions;
  const [showMoveToBrowserModal, setShowMoveToBrowserModal] = React.useState(false);

  useEffect(() => {
    if (isDepositNeeded && publicKey) {
      loadDepositData(publicKey, accountIndex, network);
      callSetDepositNeeded({isNeeded: false, publicKey, accountIndex, network});
    }
  }, [isDepositNeeded, publicKey]);

  useEffect(() => {
    callSetAddAnotherAccount(false);
    deepLink((obj) => {
      if ('tx_hash' in obj && 'account_id' in obj) {
        setPage(page + 1);
        updateAccountStatus(obj.account_id, obj.tx_hash, true);
        callSetDepositNeeded({isNeeded: false, publicKey: '', accountIndex: -1, network: ''});
      }
    }, (e) => notification.error({message: e}));
    return () => cleanDeepLink();
  }, []);

  const onMadeDepositButtonClick = async () => {
    setShowMoveToBrowserModal(true);
  };

  const onCopy = () => notification.success({message: 'Copied to clipboard!'});

  const moveToDashboard = async () =>{
    await callClearAccountsData();
    await clearWizardData();
    await setFinishedWizard(true);
  };

  const openDepositBrowser = async (moveToBrowser) => {
    if (!moveToBrowser) {
      await moveToDashboard();
      return
    }
    const accountFromApi: Record<string, any> = accountsFromApi.find(
      (account) => (account.publicKey === publicKey && account.network === network)
    );
    const currentAccount = accountDataFromProcess || accountFromApi;
    if (currentAccount) {
      const {depositTo, txData} = depositData;
      openExternalLink('', `${config.env.WEB_APP_URL}/staking-deposit?account_id=${currentAccount.id}&network_id=${NETWORKS[network].chainId}&public_key=${publicKey}&deposit_to=${depositTo}&tx_data=${txData}&id_token=${idToken}`);
    } else {
      notification.error({message: 'Account not found'});
    }
  };

  if (network) {
    return (
      <Wrapper>
        <Title>{NETWORKS[network].name} Staking Deposit</Title>
        <SubTitle>To Start Staking, you&apos;ll need to make 2 deposits:</SubTitle>
        {NETWORKS[network].label === NETWORKS.pyrmont.label ? <TestNetText publicKey={publicKey} onCopy={onCopy}/> :
          <MainNetText publicKey={publicKey} onCopy={onCopy}/>}
        <SmallText>Total: 32 {NETWORKS[network].label === NETWORKS.pyrmont.label ? 'GoETH' : 'ETH'} + gas
          fees</SmallText>
        <SmallText style={{'fontSize': '14px', 'color': theme.gray800, 'marginTop': '34px'}}>You will be transferred to
          a secured Blox webpage</SmallText>
        <ButtonsWrapper>
          <BigButton onClick={onMadeDepositButtonClick}>Continue to Web Deposit</BigButton>
          <LaterBtn onClick={moveToDashboard}>I'll Deposit Later</LaterBtn>
        </ButtonsWrapper>
        {showMoveToBrowserModal &&
        <MoveToBrowserModal onClose={(moveToBrowser) => {
          setShowMoveToBrowserModal(false);
          if (!moveToBrowser) moveToDashboard()
        }} onMoveToBrowser={openDepositBrowser}/>}
      </Wrapper>
    );
  }
  return null;
};

const mapStateToProps = (state: State) => ({
  depositData: selectors.getDepositData(state),
  accountDataFromProcess: getData(state),
  accountsFromApi: getAccounts(state),
  isDepositNeeded: getDepositNeededStatus(state),
  publicKey: getDepositToPublicKey(state),
  accountIndex: getDepositToIndex(state),
  network: getDepositToNetwork(state),
  idToken: getIdToken(state),
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  actions: bindActionCreators(wizardActions, dispatch),
  callClearAccountsData: () => dispatch(clearAccountsData()),
  callSetAddAnotherAccount: () => dispatch(setAddAnotherAccount(false)),
  callSetDepositNeeded: (payload: DepositNeededPayload) => dispatch(setDepositNeeded(payload)),
});

type Props = {
  page: number;
  setPage: (page: number) => void;
  step: number;
  setStep: (page: number) => void;
  depositData: Record<string, any>;
  accountsFromApi: { publicKey: string, id: number, network: string }[];
  accountDataFromProcess: Record<string, any> | null;
  actions: Record<string, any> | null;
  callClearAccountsData: () => void;
  callSetAddAnotherAccount: (addAnotherAccount: boolean) => void;
  callSetDepositNeeded: (payload: DepositNeededPayload) => void;
  isDepositNeeded: boolean;
  publicKey: string;
  accountIndex: number;
  network: string;
  idToken: string;
};

type DepositNeededPayload = {
  isNeeded: boolean;
  publicKey: string;
  accountIndex: number;
  network: string;
};

type State = Record<string, any>;
type Dispatch = (arg0: { type: string }) => any;

export default connect(mapStateToProps, mapDispatchToProps)(StakingDeposit);
