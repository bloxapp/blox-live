import { notification } from 'antd';
import { connect } from 'react-redux';
import styled from 'styled-components';
import React, { useEffect } from 'react';
import { bindActionCreators } from 'redux';
import theme from '~app/theme';
import config from '~app/backend/common/config';
import useRouting from '~app/common/hooks/useRouting';
import { openExternalLink } from '~app/components/common/service';
import * as actionsFromWizard from '~app/components/Wizard/actions';
import { clearDecryptProgress } from '~app/components/Wizard/actions';
import { cleanDeepLink, deepLink } from '~app/components/App/service';
import BloxApi from '~app/backend/common/communication-manager/blox-api';
import useDashboardData from '~app/components/Dashboard/useDashboardData';
import useProcessRunner from '~app/components/ProcessRunner/useProcessRunner';
import { NETWORKS } from '~app/components/Wizard/components/Validators/constants';
import { getIdToken } from '~app/components/Login/components/CallbackPage/selectors';
import { getNetwork, getDecryptedKeyStores } from '~app/components/Wizard/selectors';
import { Title, Paragraph, BackButton } from '~app/components/Wizard/components/common';
import { MainNetKeyStoreText } from '~app/components/Wizard/components/Validators/StakingDeposit/components';
import MoveToBrowserModal from '~app/components/Wizard/components/Validators/StakingDeposit/components/MoveToBrowserModal';

const Wrapper = styled.div`
  width:650px;
`;

const Button = styled.button`
  display: block;
  height: 35px;
  width: 250px;
  color: white;
  border-radius: 10px;
  border: none;
  background-color: #2536b8;
  margin-top: 20px;
  cursor: pointer;
  margin-bottom: 20px;

  &:hover {
    background-color: #2546b2;
  }

  &:disabled {
    background-color: lightgrey;
  }
`;
const ButtonDepositLater = styled.p`
  width: 250px;
  color: #2536b8;
  font-size: 16px;
  cursor: pointer;
  text-align: center;
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
  text-align: center;
`;

const bloxApi = new BloxApi();
bloxApi.init();

const DepositOverview = (props: ValidatorsSummaryProps) => {
  const { setPage, setStep, decryptedKeyStores, idToken, wizardActions, network, setPageData, pageData } = props;
  const { clearDecryptKeyStores } = wizardActions;
  const { processData, clearProcessState } = useProcessRunner();
  const { loadDataAfterNewAccount } = useDashboardData();
  const { goToPage, ROUTES } = useRouting();
  const [showMoveToBrowserModal, setShowMoveToBrowserModal] = React.useState(false);

  useEffect(() => {
    deepLink(async (obj) => {
      if ('account_id' in obj) {
        const depositedValidators = obj.account_id;
        await clearState();
        if (depositedValidators) {
          setPageData({
            isImportValidators: false,
            importedValidatorsCount: depositedValidators.split(',').length
          });
          setPage(config.WIZARD_PAGES.VALIDATOR.CONGRATULATIONS);
        } else {
          goToPage(ROUTES.DASHBOARD);
        }
      }
    }, (e) => notification.error({ message: e }));
    return () => cleanDeepLink();
  }, []);

  const moveToWebDeposit = async (moveToBrowser) => {
    if (!moveToBrowser) {
      await moveToDashboard();
      return;
    }
    const ids = processData.map(user => user.id).join(',');
    setShowMoveToBrowserModal(true);
    await openExternalLink('', `${config.env.WEB_APP_URL}/upload_deposit_file?id_token=${idToken}&account_id=${ids}&network_id=${NETWORKS[network].chainId}`);
  };

  const moveToDashboard = async () => {
    await clearState();
    goToPage(ROUTES.DASHBOARD);
  };

  const clearState = async () => {
    await loadDataAfterNewAccount();
    clearDecryptKeyStores();
    clearDecryptProgress();
    clearProcessState();
  };

  const onMadeDepositButtonClick = async () => {
    setShowMoveToBrowserModal(true);
  };

  return (
    <Wrapper>
      <BackButton onClick={() => {
        setStep(config.WIZARD_STEPS.VALIDATOR_SETUP);
        setPage(config.WIZARD_PAGES.VALIDATOR.VALIDATOR_SUMMARY);
        clearProcessState();
      }} />
      <Title>{NETWORKS[network].name} Staking Deposit</Title>
      <Paragraph style={{ marginBottom: 5 }}>
        To start staking, first, you&apos;ll need to make a deposit:
      </Paragraph>
      <MainNetKeyStoreText network={network} amountOfValidators={decryptedKeyStores.length} publicKey={''} onCopy={() => {}} />
      {decryptedKeyStores.length > 1 && (
        <Paragraph style={{fontWeight: 'bold', color: '#2536b8', marginTop: 10 }}>
          Total: {decryptedKeyStores.length * 32} ETH + gas fees
        </Paragraph>
      )}

      <SmallText>
        You will be transferred to
        a secured Blox webpage
      </SmallText>

      <ButtonsWrapper>
        <Button onClick={() => { onMadeDepositButtonClick(); }}>
          Continue to Web Deposit
        </Button>
        <ButtonDepositLater onClick={() => { moveToDashboard(); }}>
          I&apos;ll Deposit Later
        </ButtonDepositLater>
      </ButtonsWrapper>

      {showMoveToBrowserModal && (
        <MoveToBrowserModal
          onClose={(moveToBrowser) => {
            setShowMoveToBrowserModal(false);
            if (!moveToBrowser) moveToDashboard();
          }}
          onMoveToBrowser={moveToWebDeposit}
        />
      )}
    </Wrapper>
  );
};

type ValidatorsSummaryProps = {
  idToken: any;
  pageData: any;
  network: string;
  decryptedKeyStores: any;
  setPage: (page: number) => void;
  setStep: (page: number) => void;
  setPageData: (data: any) => void;
  wizardActions: Record<string, any>;
};

const mapStateToProps = (state: any) => ({
  network: getNetwork(state),
  decryptedKeyStores: getDecryptedKeyStores(state),
  idToken: getIdToken(state),
});

const mapDispatchToProps = (dispatch) => ({
  wizardActions: bindActionCreators(actionsFromWizard, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(DepositOverview);
