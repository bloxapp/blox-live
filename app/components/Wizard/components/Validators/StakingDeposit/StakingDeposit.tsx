import React, { useEffect } from 'react';
import { notification } from 'antd';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { bindActionCreators } from 'redux';
import theme from '~app/theme';
import config from '~app/backend/common/config';
import useRouting from '~app/common/hooks/useRouting';
import * as selectors from '~app/components/Wizard/selectors';
import * as wizardActions from '~app/components/Wizard/actions';
import { openExternalLink } from '~app/components/common/service';
import { getData } from '~app/components/ProcessRunner/selectors';
import { deepLink, cleanDeepLink } from '~app/components/App/service';
import useDashboardData from '~app/components/Dashboard/useDashboardData';
import { Title, BigButton } from '~app/components/Wizard/components/common';
import { selectedKeystoreMode, selectedSeedMode } from '~app/common/service';
import { NETWORKS } from '~app/components/Wizard/components/Validators/constants';
import { getIdToken } from '~app/components/Login/components/CallbackPage/selectors';
import { MainNetText, TestNetText } from '~app/components/Wizard/components/Validators/StakingDeposit/components';
import MoveToBrowserModal from '~app/components/Wizard/components/Validators/StakingDeposit/components/MoveToBrowserModal';
import {
  clearAccountsData,
  setDepositNeeded,
  setAddAnotherAccount
} from '~app/components/Accounts/actions';
import {
  getAccounts,
  getDepositNeededStatus,
  getDepositToPublicKey,
  getDepositToIndex,
  getDepositToNetwork
} from '~app/components/Accounts/selectors';

const Wrapper = styled.div`
  width:580px;
`;

const SubTitle = styled.div`
  font-size: 16px;
  font-weight: 400;
  color: ${theme.gray800};
  margin-top: 24px;
`;

const SmallText = styled.div`
  font-size: 12px;
  font-weight: 500;
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
    color: ${(props: any) => theme[props.color] || props.theme.primary900};
`;

const StakingDeposit = (props: Props) => {
  const {
    setPage, depositData, accountsFromApi, actions, callSetAddAnotherAccount, accountDataFromProcess,
    isDepositNeeded, publicKey, callSetDepositNeeded, callClearAccountsData, accountIndex, network, idToken
  } = props;
  const { loadDepositData, setFinishedWizard, clearWizardData,
    clearDecryptKeyStores, clearDecryptProgress } = actions;
  const [showMoveToBrowserModal, setShowMoveToBrowserModal] = React.useState(false);
  const { goToPage, ROUTES } = useRouting();
  const { loadDataAfterNewAccount } = useDashboardData();

  useEffect(() => {
    if (isDepositNeeded && publicKey && selectedSeedMode()) {
      loadDepositData(publicKey, accountIndex, network);
    }
  }, [isDepositNeeded, publicKey]);

  useEffect(() => {
    callSetAddAnotherAccount(false);
    deepLink((obj) => {
      if ('account_id' in obj) {
        clearDecryptKeyStores();
        clearDecryptProgress();
        callSetDepositNeeded({
          isNeeded: false,
          publicKey: '',
          accountIndex: -1,
          network: ''
        });
        loadDataAfterNewAccount().then(() => {
          setPage(config.WIZARD_PAGES.VALIDATOR.CONGRATULATIONS);
        });
      }
    }, (e) => notification.error({ message: e }));
    return () => cleanDeepLink();
  }, []);

  const onMadeDepositButtonClick = async () => {
    setShowMoveToBrowserModal(true);
  };

  const onCopy = () => notification.success({ message: 'Copied to clipboard!' });

  const moveToDashboard = async () => {
    clearDecryptKeyStores();
    clearDecryptProgress();
    await callClearAccountsData();
    await clearWizardData();
    await setFinishedWizard(true);
    goToPage(ROUTES.DASHBOARD);
  };

  const openDepositBrowser = async (moveToBrowser) => {
    if (!moveToBrowser) {
      await moveToDashboard();
      return;
    }
    const accountFromApi: Record<string, any> = accountsFromApi.find(
      (account) => (account.publicKey === publicKey && account.network === network)
    );

    let currentAccount: any;
    if (accountDataFromProcess && accountDataFromProcess.length) {
      // eslint-disable-next-line prefer-destructuring
      currentAccount = accountDataFromProcess[0];
    } else {
      currentAccount = accountFromApi;
    }

    if (currentAccount) {
      let stakingDepositUrl = '';
      if (selectedSeedMode()) {
        const { txData } = depositData;
        stakingDepositUrl = `${config.env.WEB_APP_URL}/staking-deposit?account_id=${currentAccount.id}&network_id=${NETWORKS[network].chainId}&tx_data=${txData}&id_token=${idToken}`;
      } else if (selectedKeystoreMode()) {
        stakingDepositUrl = `${config.env.WEB_APP_URL}/upload_deposit_file?id_token=${idToken}&account_id=${currentAccount.id}&network_id=${NETWORKS[network].chainId}`;
      }
      await openExternalLink('', stakingDepositUrl);
    } else {
      notification.error({ message: 'Account not found' });
    }
  };

  if (network) {
    const smallTextStyle = {'fontSize': '14px', 'color': theme.gray800, 'marginTop': '34px'};

    return (
      <Wrapper>
        <Title>{NETWORKS[network].name} Staking Deposit</Title>

        <SubTitle>To Start Staking, you&apos;ll need to make 2 deposits:</SubTitle>

        {NETWORKS[network].label === NETWORKS.prater.label
          ? <TestNetText publicKey={publicKey} onCopy={onCopy} />
          : <MainNetText publicKey={publicKey} onCopy={onCopy} />
        }

        <SmallText>
          Total: 32 {NETWORKS[network].label === NETWORKS.prater.label ? 'GoETH' : 'ETH'} + gas
          fees
        </SmallText>

        <SmallText
          style={smallTextStyle}
        >
          You will be transferred to
          a secured Blox webpage
        </SmallText>

        <ButtonsWrapper>
          <BigButton onClick={onMadeDepositButtonClick}>Continue to Web Deposit</BigButton>
          <LaterBtn onClick={moveToDashboard}>I&apos;ll Deposit Later</LaterBtn>
        </ButtonsWrapper>

        {showMoveToBrowserModal && (
          <MoveToBrowserModal
            onClose={(moveToBrowser) => {
              setShowMoveToBrowserModal(false);
              if (!moveToBrowser) moveToDashboard();
            }}
            onMoveToBrowser={openDepositBrowser}
          />
        )}
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
