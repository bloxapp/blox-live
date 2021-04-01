import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import styled from 'styled-components';
import { Icon } from 'common/components';
import config from '~app/backend/common/config';
import useRouting from '~app/common/hooks/useRouting';
import * as actionsFromWizard from '~app/components/Wizard/actions';
import * as actionsFromAccounts from '~app/components/Accounts/actions';
import { getAddAnotherAccount } from '~app/components/Accounts/selectors';
import useDashboardData from '~app/components/Dashboard/useDashboardData';
import { getWizardFinishedStatus } from '~app/components/Wizard/selectors';
import { contentAnimation } from '~app/components/Wizard/components/common';
import useProcessRunner from '~app/components/ProcessRunner/useProcessRunner';
import Navigation from '~app/components/Wizard/components/common/Template/Navigation';

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
`;

const Content = styled.div`
  width: 81vw;
  padding: 64px 8.5vw;
  height: 100%;
  display: flex;
  position: relative;
`;

const ComponentWrapper = styled.div`
  width: 100%;
  position: relative;
  animation: ${contentAnimation} 1s ease;
  z-index: 1;
`;

const BackgroundImage = styled.img`
  width: 300px;
  height: 300px;
  position: absolute;
  right: 0;
`;

const CloseButton = styled.div`
  position:absolute;
  right:24px;
  top:24px;
  z-index:10;
  cursor:pointer;
`;

const BackButton = styled.div`
  position:absolute;
  left:112px;
  top:64px;
  z-index:10;
  cursor:pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 500;
  color: ${({theme}) => theme.primary600}
`;

const Template = (props: Props) => {
  const { component, bgImage, backButton, wizardActions, accountsActions, ...rest } = props;
  const { accounts, step, page, setPage, pageData, addAnotherAccount } = rest;
  const { finishValidatorSetup } = pageData;
  const { clearAccountsData } = accountsActions;
  const { setFinishedWizard, clearWizardData } = wizardActions;
  const { goToPage, ROUTES } = useRouting();
  const { isLoading, isDone, processData } = useProcessRunner();

  /**
   * Close button is show in a template according to conditions:
   *  - Wizard is opened
   *  - Dashboard is shown
   *    - accounts already exists
   *    - or it was drop-off during first installation
   *    - step == 2 means KeyVault setup already finished
   */
  const addAdditionalAccount =
    accounts?.length >= 1 && (
      finishValidatorSetup
      || addAnotherAccount
    )
    && step === config.WIZARD_STEPS.VALIDATOR_SETUP;

  const { loadDashboardData } = useDashboardData();

  const onCloseClick = async () => {
    if (!isLoading && isDone && processData) {
      await clearAccountsData();
      await clearWizardData();
      await setFinishedWizard(true);
      await loadDashboardData();
    }
    await goToPage(ROUTES.DASHBOARD);
  };

  const onBackClick = () => {
    setPage(page - 1);
  };

  return (
    <Wrapper>
      <Navigation {...rest} addAdditionalAccount={addAdditionalAccount} />
      <Content>
        {addAdditionalAccount && (
          <CloseButton onClick={onCloseClick}>
            <Icon name={'close'} fontSize={'24px'} color={'gray900'} />
          </CloseButton>
        )}
        {backButton && (
          <BackButton onClick={onBackClick}>
            <Icon name={'arrow-back'} fontSize={'15px'} color={'primary600'} />
            {'Back'}
          </BackButton>
        )}
        <ComponentWrapper>{React.cloneElement(component)}</ComponentWrapper>
        {bgImage && <BackgroundImage src={bgImage} />}
      </Content>
    </Wrapper>
  );
};

const mapStateToProps = (state) => ({
  isFinishedWizard: getWizardFinishedStatus(state),
  addAnotherAccount: getAddAnotherAccount(state),
});

const mapDispatchToProps = (dispatch) => ({
  wizardActions: bindActionCreators(actionsFromWizard, dispatch),
  accountsActions: bindActionCreators(actionsFromAccounts, dispatch),
});

type Props = {
  component: JSX.Element;
  bgImage: string;
  backButton?: boolean;
  page: number;
  pageData: any;
  setPage: (page: number) => void;
  step: number;
  setStep: (page: number) => void;
  wizardActions: Record<string, any>;
  accountsActions: Record<string, any>;
  isFinishedWizard: boolean;
  addAnotherAccount: boolean;
  accounts: any;
};

export default connect(mapStateToProps, mapDispatchToProps)(Template);
