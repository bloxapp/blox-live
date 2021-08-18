import {notification} from 'antd';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { bindActionCreators } from 'redux';
import React, {useEffect, useState} from 'react';
import theme from '~app/theme';
import config from '~app/backend/common/config';
import useRouting from '~app/common/hooks/useRouting';
import ProcessLoader from '~app/common/components/ProcessLoader';
import { openExternalLink } from '~app/components/common/service';
import * as actionsFromWizard from '~app/components/Wizard/actions';
import { cleanDeepLink, deepLink } from '~app/components/App/service';
import BloxApi from '~app/backend/common/communication-manager/blox-api';
import useDashboardData from '~app/components/Dashboard/useDashboardData';
import useProcessRunner from '~app/components/ProcessRunner/useProcessRunner';
import { NETWORKS } from '~app/components/Wizard/components/Validators/constants';
import usePasswordHandler from '~app/components/PasswordHandler/usePasswordHandler';
import { getIdToken } from '~app/components/Login/components/CallbackPage/selectors';
import { getNetwork, getDecryptedKeyStores } from '~app/components/Wizard/selectors';
import { Title, Paragraph, BackButton } from '~app/components/Wizard/components/common';
import { MainNetKeyStoreText } from '~app/components/Wizard/components/Validators/StakingDeposit/components';

const Wrapper = styled.div`
  width:650px;
`;

const Button = styled.button`
  display: block;
  width: 250px;
  height: 35px;
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

const bloxApi = new BloxApi();
bloxApi.init();

const DepositOverview = (props: ValidatorsSummaryProps) => {
  const { setPage, setStep, decryptedKeyStores, idToken, wizardActions, network } = props;
  const { clearDecryptKeyStores } = wizardActions;
  const { isLoading, isDone, processData, error, startProcess, clearProcessState, loaderPercentage, processMessage } = useProcessRunner();
  const { loadDataAfterNewAccount } = useDashboardData();
  const { checkIfPasswordIsNeeded } = usePasswordHandler();
  const { goToPage, ROUTES } = useRouting();
  const [moveToDepositPage, setMoveToDepositPage] = useState(true);

  useEffect(() => {
    deepLink(async (obj) => {
      if ('account_id' in obj) {
        const depositedValidators = obj.account_id;
        await loadDataAfterNewAccount();
        clearDecryptKeyStores();
        clearProcessState();

        if (depositedValidators) {
          setPage(config.WIZARD_PAGES.VALIDATOR.CONGRATULATIONS);
        } else {
          goToPage(ROUTES.DASHBOARD);
        }
      }
    }, (e) => notification.error({ message: e }));
    return () => cleanDeepLink();
  }, []);

  useEffect(() => {
    if (!isLoading && isDone && !error) {
      clearProcessState();
      const depositIds = processData.map(user => user.id).join(',');
      if (moveToDepositPage) moveToWebDeposit(depositIds);
    }
  }, [isLoading, isDone, error]);

  const moveToWebDeposit = async (ids: string) => {
    await openExternalLink('', `${config.env.WEB_APP_URL}/upload_deposit_file?id_token=${idToken}&account_id=${ids}&network_id=${NETWORKS[network].chainId}`);
  };

  const onNextButtonClick = () => {
    const onSuccess = () => {
      if (error) {
        clearProcessState();
      }
      if (!isLoading) {
        startProcess('createAccount',
          `Create Validator${decryptedKeyStores.length > 0 ? 's' : ''}...`,
          {
            inputData: decryptedKeyStores.map(account => account.privateKey).join(',')
          });
      }
    };
    checkIfPasswordIsNeeded(onSuccess);
  };
  // const { } = wizardActions;
  return (
    <Wrapper>
      <BackButton onClick={() => {
        setStep(config.WIZARD_STEPS.VALIDATOR_SETUP);
        setPage(config.WIZARD_PAGES.VALIDATOR.VALIDATOR_SUMMARY);
      }} />
      <Title>{NETWORKS[network].name} Staking Deposit</Title>
      <Paragraph style={{ marginBottom: 5 }}>
        To start staking, first, you&apos;ll need to make a deposit:
      </Paragraph>
      <MainNetKeyStoreText amountOfValidators={decryptedKeyStores.length} publicKey={''} onCopy={() => {}} />
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
        <Button disabled={isLoading} onClick={() => { setMoveToDepositPage(true); onNextButtonClick(); }}>
          Continue to Web Deposit
        </Button>
        {processMessage && <ProcessLoader text={processMessage} precentage={loaderPercentage} />}
      </ButtonsWrapper>
    </Wrapper>
  );
};

type ValidatorsSummaryProps = {
  network: string;
  wizardActions: Record<string, any>;
  setPage: (page: number) => void;
  setStep: (page: number) => void;
  decryptedKeyStores: any;
  idToken: any;
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
