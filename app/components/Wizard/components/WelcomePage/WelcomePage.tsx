import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { bindActionCreators } from 'redux';
import saga from '../../saga';
import ButtonWithIcon from './ButtonWithIcon';
import * as wizardActions from '../../actions';
import { useInjectSaga } from 'utils/injectSaga';
import * as wizardSelectors from '../../selectors';
import { InfoWithTooltip } from 'common/components';
import * as userSelectors from '../../../User/selectors';
import { MODAL_TYPES } from '../../../Dashboard/constants';
import * as accountSelectors from '../../../Accounts/selectors';
import { allAccountsDeposited } from '../../../Accounts/service';
import Connection from 'backend/common/store-manager/connection';
import * as actionsFromDashboard from '../../../Dashboard/actions';
import usePasswordHandler from '../../../PasswordHandler/usePasswordHandler';

import keyVaultImg from '../../assets/img-key-vault.svg';
import mainNetImg from '../../assets/img-validator-main-net.svg';
import bgImage from '../../../../../app/assets/images/bg_staking.jpg';

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  min-height:100%;
  display: flex;
`;

const Left = styled.div`
  width: 45vw;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-image: url(${bgImage});
  background-size: cover;
  color: ${({ theme }) => theme.gray50};
  font-size: 54px;
  font-weight: 500;
  line-height: 76px;
  text-align: center;
`;

const Right = styled.div`
  width: 55vw;
  height: 100%;
  padding: 100px 11vw 0 11vw;
`;

const IntroText = styled.div`
  color: ${({ theme }) => theme.gray600};
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 20px;
`;

let toolTipText = "Blox KeyVault is responsible for securing your private validator keys and signing your validator's '";
toolTipText += 'activity on the Beacon Chain. Blox will communicate with your secured KeyVault every time your validator';
toolTipText += 'is requested to attest/propose. To do so, KeyVault must be online 24/7.';

const key = 'wizard';

const WelcomePage = (props: Props) => {
  const { setPage, setStep, step, actions, dashboardActions, wallet, accounts, isLoading,
          isDepositNeeded, addAnotherAccount, userInfo } = props;
  const { loadWallet, setFinishedWizard } = actions;
  const { setModalDisplay } = dashboardActions;

  const { checkIfPasswordIsNeeded } = usePasswordHandler();
  useInjectSaga({ key, saga, mode: '' });
  const [showStep2, setStep2Status] = useState(false);

  useEffect(() => {
    if (!isLoading && !wallet) {
      loadWallet();
    }

    const hasWallet = wallet && (wallet.status === 'active' || wallet.status === 'offline');
    const hasSeed = Connection.db().exists('seed');
    const storedUuid = Connection.db().get('uuid');

    const isInRecoveryProcess = Connection.db().get('inRecoveryProcess');
    const isPrimaryDevice = !!storedUuid && (storedUuid === userInfo.uuid);

    if (hasWallet) {
      if (!storedUuid && !userInfo.uuid && accounts?.length > 0) {
        setModalDisplay({ show: true, type: MODAL_TYPES.DEVICE_SWITCH});
        return;
      }
      if (userInfo.uuid && ((!isPrimaryDevice && accounts?.length > 0) || isInRecoveryProcess)) {
        setModalDisplay({ show: true, type: MODAL_TYPES.DEVICE_SWITCH});
        return;
      }
      if (hasSeed) {
        if (addAnotherAccount) {
          redirectToCreateAccount();
          return;
        }
        if (!allAccountsDeposited(accounts)) {
          if (isDepositNeeded) {
            redirectToDepositPage();
            return;
          }
          setFinishedWizard(true);
          return;
        }
        setStep2Status(true);
        return;
      }
      if (storedUuid && accounts?.length === 0) {
        redirectToPassPhrasePage();
      }
    }
  }, [isLoading]);

  const onStep1Click = () => !showStep2 && setPage(1);

  const onStep2Click = () => {
    if (wallet.status === 'offline') {
      const onSuccess = () => setModalDisplay({ show: true, type: MODAL_TYPES.REACTIVATION, text: ''});
      checkIfPasswordIsNeeded(onSuccess);
    }
    else if (wallet.status === 'active') {
      redirectToCreateAccount();
    }
  };

  const redirectToPassPhrasePage = () => setPage(4);

  const redirectToCreateAccount = () => {
    if (!accounts || !accounts.length) {
      setStep(2);
      setPage(4);
    } else {
      setStep(step + 1);
      setPage(6);
    }
  };

  const redirectToDepositPage = () => {
    setStep(step + 1);
    setPage(8);
  };

  return (
    <Wrapper>
      <Left>
        Start Your <br />Staking Journey
      </Left>
      <Right>
        <IntroText>
          This one-time wizard will guide you through creating your KeyVault
          <InfoWithTooltip title={toolTipText} placement="bottom" />
          remote signer and validator client.
        </IntroText>
        <ButtonWithIcon title="Step 1" subTitle="KeyVault Setup" image={keyVaultImg}
          isDisabled={showStep2} onClick={onStep1Click} isLoading={isLoading}
        />
        <ButtonWithIcon title="Step 2" subTitle="Create A Validator" image={mainNetImg}
          isDisabled={!showStep2} onClick={onStep2Click}
        />
      </Right>
    </Wrapper>
  );
};

const mapStateToProps = (state: State) => ({
  isLoading: wizardSelectors.getIsLoading(state),
  wallet: wizardSelectors.getWallet(state),
  accounts: accountSelectors.getAccounts(state),
  isDepositNeeded: accountSelectors.getDepositNeededStatus(state),
  addAnotherAccount: accountSelectors.getAddAnotherAccount(state),
  userInfo: userSelectors.getInfo(state),
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  actions: bindActionCreators(wizardActions, dispatch),
  dashboardActions: bindActionCreators(actionsFromDashboard, dispatch)
});

type Props = {
  setPage: (page: number) => void;
  setStep: (step: number) => void;
  step: number;
  actions: Record<string, any>;
  dashboardActions: Record<string, any>;
  wallet: Record<string, any>;
  accounts: [];
  isLoading: boolean;
  isDepositNeeded: boolean;
  addAnotherAccount: boolean;
  userInfo: Record<string, any>;
};

type State = Record<string, any>;
type Dispatch = (arg0: { type: string }) => any;

export default connect(mapStateToProps, mapDispatchToProps)(WelcomePage);
