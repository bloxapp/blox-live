import React, { useState } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import config from '~app/backend/common/config';
import Header from '~app/components/common/Header';
import { DiscordButton } from '~app/common/components';
import { setWizardPageData } from '~app/components/Wizard/actions';
import { getAddAnotherAccount } from '~app/components/Accounts/selectors';
import ContentManager from '~app/components/Wizard/components/ContentManager';
import { getPageData, getWizardFinishedStatus } from '~app/components/Wizard/selectors';

const Wrapper = styled.div`
  height: 100%;
  background-color: ${({ theme }) => theme.gray50};
`;

const Wizard = (props: Props) => {
  const { isFinishedWizard, addAnotherAccount, pageData, setPageData, accounts } = props;
  const [step, setStep] = useState(1);
  const [page, setPage] = useState(0);

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
  pageData: getPageData(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  setPageData: (data: any) => dispatch(setWizardPageData(data))
});

type Props = {
  isFinishedWizard: boolean;
  addAnotherAccount: boolean;
  pageData: any;
  setPageData: (data: any) => void;
  accounts: any;
};

type Dispatch = (arg0: { type: string }) => any;

export default connect(mapStateToProps, mapDispatchToProps)(Wizard);
