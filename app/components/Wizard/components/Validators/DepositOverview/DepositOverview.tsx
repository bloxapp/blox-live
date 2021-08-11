import React, {useEffect, useState} from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import {bindActionCreators} from 'redux';
import config from '~app/backend/common/config';
import BloxApi from '~app/backend/common/communication-manager/blox-api';
import { getIdToken } from '~app/components/Login/components/CallbackPage/selectors';
import { getNetwork, getDecryptedKeyStores } from '~app/components/Wizard/selectors';
import { Title, Paragraph, BackButton, BigButton } from '~app/components/Wizard/components/common';
import { MainNetKeyStoreText } from '~app/components/Wizard/components/Validators/StakingDeposit/components';
import theme from '../../../../../theme';
import * as actionsFromWizard from '../../../actions';
import {openExternalLink} from '../../../../common/service';
import useProcessRunner from '../../../../ProcessRunner/useProcessRunner';
import useDashboardData from '../../../../Dashboard/useDashboardData';
import usePasswordHandler from '../../../../PasswordHandler/usePasswordHandler';
import {NETWORKS} from '../constants';

const Wrapper = styled.div`
  width:650px;
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
    color: ${({theme, color}) => theme[color] || theme.primary900};
`;

const bloxApi = new BloxApi();
bloxApi.init();

const DepositOverview = (props: ValidatorsSummaryProps) => {
  const { setPage, setStep, decryptedKeyStores, idToken, network } = props;
  const { isLoading, isDone, processData, error, startProcess, clearProcessState, loaderPercentage, processMessage } = useProcessRunner();
  const { loadDataAfterNewAccount } = useDashboardData();
  const { checkIfPasswordIsNeeded } = usePasswordHandler();
  const [moveToDepositPage, setMoveToDepositPage] = useState(true);

  useEffect(() => {
    if (!isLoading && isDone && !error) {
      clearProcessState();
      const depositIds = processData.map(user => user.id).join(',');
      if (moveToDepositPage) moveToWebDeposit(depositIds);
    }
  }, [isLoading, isDone, error]);

  const moveToWebDeposit = async (ids: string) => {
    await openExternalLink('', `${config.env.WEB_APP_URL}/upload_deposit_file?id_token=${idToken}&id=${ids}&network_id=${NETWORKS[network].chainId}`);
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
      <Title>Mainnet Staking Deposit</Title>
      <Paragraph style={{ marginBottom: 5 }}>
        To start staking, first, you'll need to make a deposit:
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
        <BigButton onClick={() => { setMoveToDepositPage(true); onNextButtonClick(); }}>Continue to Web Deposit</BigButton>
        <LaterBtn onClick={onNextButtonClick}>I&apos;ll Deposit Later</LaterBtn>
      </ButtonsWrapper>
    </Wrapper>
  );
};

type ValidatorsSummaryProps = {
  network: string;
  wizardActions: Record<string, any>;
  setPage: (page: number) => void;
  setStep: (page: number) => void;
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
