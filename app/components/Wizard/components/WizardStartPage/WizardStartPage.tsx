import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { bindActionCreators } from 'redux';
import wizardSaga from '~app/components/Wizard/saga';
import config from '~app/backend/common/config';
import useRouting from '~app/common/hooks/useRouting';
import { useInjectSaga } from '~app/utils/injectSaga';
import { InfoWithTooltip } from '~app/common/components';
import * as userSelectors from '~app/components/User/selectors';
import * as wizardActions from '~app/components/Wizard/actions';
import { MODAL_TYPES } from '~app/components/Dashboard/constants';
import * as wizardSelectors from '~app/components/Wizard/selectors';
import Connection from '~app/backend/common/store-manager/connection';
import * as accountSelectors from '~app/components/Accounts/selectors';
import { allAccountsDeposited } from '~app/components/Accounts/service';
import * as actionsFromDashboard from '~app/components/Dashboard/actions';
import useDashboardData from '~app/components/Dashboard/useDashboardData';
import usePasswordHandler from '~app/components/PasswordHandler/usePasswordHandler';
import ButtonWithIcon from '~app/components/Wizard/components/WizardStartPage/ButtonWithIcon';
import keyVaultImg from '../../assets/img-key-vault.svg';
import mainNetImg from '../../assets/img-validator-main-net.svg';
import bgImage from '../../../../assets/images/bg_staking.jpg';

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

const WizardStartPage = (props: Props) => {
  useInjectSaga({ key: 'wizard', saga: wizardSaga, mode: '' });

  const { page, setPage, setStep, step, actions, dashboardActions, wallet, accounts, isLoading,
          isDepositNeeded, addAnotherAccount, userInfo } = props;
  const { setModalDisplay } = dashboardActions;
  const { loadWallet } = actions;
  const { checkIfPasswordIsNeeded } = usePasswordHandler();
  const { loadDataAfterNewAccount } = useDashboardData();
  const { goToPage, ROUTES } = useRouting();
  const [showStep2, setStep2Status] = useState(false);

  const goToDashboard = () => {
    // Reload accounts and event logs before reaching dash
    loadDataAfterNewAccount().then(() => {
      goToPage(ROUTES.DASHBOARD);
    });
  };

  useEffect(() => {
    if (!isLoading && !wallet) {
      loadWallet();
    }

    const hasWallet = wallet && (wallet.status === 'active' || wallet.status === 'offline');
    const hasSeed = Connection.db().exists('seed');
    const finishedRecoveryOrInstallProcess = Connection.db().get('uuid');
    const isInRecoveryProcess = Connection.db().get('inRecoveryProcess');
    const isPrimaryDevice = !!finishedRecoveryOrInstallProcess && (finishedRecoveryOrInstallProcess === userInfo.uuid);

    if (hasWallet) {
      // Has wallet but run on different device
      if (!finishedRecoveryOrInstallProcess && !userInfo.uuid && accounts?.length > 0) {
        setModalDisplay({ show: true, type: MODAL_TYPES.DEVICE_SWITCH });
        return;
      }
      if (userInfo.uuid && ((!isPrimaryDevice && accounts?.length > 0) || isInRecoveryProcess)) {
        setModalDisplay({ show: true, type: MODAL_TYPES.DEVICE_SWITCH });
        return;
      }

      // Having saved seed in the app
      if (hasSeed) {
        // Clicked on "Add Validator" button
        if (addAnotherAccount) {
          redirectToCreateAccount();
          return;
        }

        // Have accounts and not all of them are deposited
        // IMPORTANT: update accounts from API before closing wizard!
        if (accounts?.length && !allAccountsDeposited(accounts)) {
          // Clicked on "Continue to deposit"
          if (isDepositNeeded) {
            redirectToDepositPage();
            return;
          }

          // Clicked on "I'll deposit later"
          goToPage(ROUTES.DASHBOARD);
          return;
        }

        // Not finished initial installation (no accounts when there's seed)
        // Empty dash feature
        if (!accounts?.length) {
          setStep2Status(true);
          return;
        }
      }

      // No seed and just installed or recovered without accounts
      // Should import or generate seed
      if (finishedRecoveryOrInstallProcess && accounts?.length === 0) {
        if (page === config.WIZARD_PAGES.WALLET.IMPORT_OR_GENERATE_SEED) {
          setPage(config.WIZARD_PAGES.WALLET.CONGRATULATIONS);
          return;
        }
        redirectToImportOrGenerateSeed();
        return;
      }

      // After all possible scenarios the only remaining is to return to dash
      goToDashboard();
    }
  }, [isLoading]);

  const onStep1Click = () => {
    !showStep2 && setPage(config.WIZARD_PAGES.WALLET.SELECT_CLOUD_PROVIDER);
  };

  const onStep2Click = () => {
    if (wallet.status === 'offline') {
      const onSuccess = () => setModalDisplay({ show: true, type: MODAL_TYPES.REACTIVATION, text: ''});
      checkIfPasswordIsNeeded(onSuccess);
    }
    else if (wallet.status === 'active') {
      redirectToCreateAccount();
    }
  };

  const redirectToImportOrGenerateSeed = () => {
    setPage(config.WIZARD_PAGES.WALLET.IMPORT_OR_GENERATE_SEED);
  };

  const redirectToCreateAccount = () => {
    if (!accounts?.length) {
      setStep(config.WIZARD_STEPS.VALIDATOR_SETUP);
      setPage(config.WIZARD_PAGES.WALLET.IMPORT_OR_GENERATE_SEED);
    } else {
      setStep(step + 1);
      setPage(config.WIZARD_PAGES.VALIDATOR.SELECT_NETWORK);
    }
  };

  const redirectToDepositPage = () => {
    setStep(step + 1);
    setPage(config.WIZARD_PAGES.VALIDATOR.STAKING_DEPOSIT);
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
        <ButtonWithIcon title="Step 2" subTitle="Validator Setup" image={mainNetImg}
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
  page: number;
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

export default connect(mapStateToProps, mapDispatchToProps)(WizardStartPage);
