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
  const {
    page,
    step,
    setPage,
    setStep,
    pageData,
    accounts,
    setPageData,
    isFinishedWizard,
    addAnotherAccount
  } = props;

  const withMenu = !isFinishedWizard && addAnotherAccount && step === config.WIZARD_STEPS.VALIDATOR_SETUP;

  const contentManagerProps = {
    page,
    step,
    accounts,
    setStep,
    setPage,
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
  page: getPage(state),
  step: getStep(state),
  pageData: getPageData(state),
  addAnotherAccount: getAddAnotherAccount(state),
  isFinishedWizard: getWizardFinishedStatus(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  setPage: (page: any) => dispatch(setWizardPage(page)),
  setStep: (page: any) => dispatch(setWizardStep(page)),
  setPageData: (data: any) => dispatch(setWizardPageData(data))
});

type Props = {
  page: number;
  step: number;
  pageData: any;
  accounts: any;
  isFinishedWizard: boolean;
  addAnotherAccount: boolean;
  setPage: (page: number) => void;
  setStep: (page: number) => void;
  setPageData: (data: any) => void;
};

type Dispatch = (arg0: { type: string }) => any;

export default connect(mapStateToProps, mapDispatchToProps)(Wizard);
