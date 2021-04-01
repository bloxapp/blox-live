import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import config from '~app/backend/common/config';
import Header from '~app/components/common/Header';
import { DiscordButton } from '~app/common/components';
import { getAddAnotherAccount } from '~app/components/Accounts/selectors';
import ContentManager from '~app/components/Wizard/components/ContentManager';
import {
  setWizardPage,
  setWizardPageData,
  setWizardStep
} from '~app/components/Wizard/actions';
import { getPage, getPageData, getStep, getWizardFinishedStatus } from '~app/components/Wizard/selectors';

const Wrapper = styled.div`
  height: 100%;
  background-color: ${({ theme }) => theme.gray50};
`;

const Wizard = (props: Props) => {
  const { isFinishedWizard, addAnotherAccount, pageData, setPageData, page, setPage,
    step, setStep, accounts } = props;

  const withMenu = !isFinishedWizard && addAnotherAccount && step === config.WIZARD_STEPS.VALIDATOR_SETUP;

  const contentManagerProps = {
    accounts,
    page,
    setPage,
    step,
    setStep,
    pageData,
    setPageData: (data: any) => {
      setPageData({
        ...pageData,
        ...data
      });
    },
    clearPageData: () => {
      setPageData({});
    }
  };

  return (
    <Wrapper>
      <Header withMenu={withMenu} />
      <ContentManager {...contentManagerProps} />
      <DiscordButton />
    </Wrapper>
  );
};

const mapStateToProps = (state) => ({
  isFinishedWizard: getWizardFinishedStatus(state),
  addAnotherAccount: getAddAnotherAccount(state),
  pageData: getPageData(state),
  page: getPage(state),
  step: getStep(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  setPageData: (data: any) => dispatch(setWizardPageData(data)),
  setPage: (page: any) => dispatch(setWizardPage(page)),
  setStep: (page: any) => dispatch(setWizardStep(page))
});

type Props = {
  isFinishedWizard: boolean;
  addAnotherAccount: boolean;
  pageData: any;
  setPageData: (data: any) => void;
  setPage: (page: number) => void;
  setStep: (page: number) => void;
  page: number;
  step: number;
  accounts: any;
};

type Dispatch = (arg0: { type: string }) => any;

export default connect(mapStateToProps, mapDispatchToProps)(Wizard);
