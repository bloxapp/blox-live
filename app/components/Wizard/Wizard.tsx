import React, { useState } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import Header from '../common/Header';
import { DiscordButton } from 'common/components';
import { getWizardFinishedStatus } from './selectors';
import ContentManager from './components/ContentManager';
import { getAddAnotherAccount } from '../Accounts/selectors';

const Wrapper = styled.div`
  height: 100%;
  min-height:100%;
  background-color: ${({ theme }) => theme.gray50};
`;

const Wizard = (props: Props) => {
  const { isFinishedWizard, addAnotherAccount } = props;
  const [step, setStep] = useState(1);
  const [page, setPage] = useState(0);

  const withMenu = !isFinishedWizard && addAnotherAccount && step === 2;

  const contentManagerProps = { page, setPage, step, setStep };

  return (
    <Wrapper>
      <Header withMenu={withMenu} isDashboard={false} />
      <ContentManager {...contentManagerProps} />
      <DiscordButton />
    </Wrapper>
  );
};

const mapStateToProps = (state) => ({
  isFinishedWizard: getWizardFinishedStatus(state),
  addAnotherAccount: getAddAnotherAccount(state),
});

type Props = {
  isFinishedWizard: boolean;
  addAnotherAccount: boolean;
};

export default connect(mapStateToProps)(Wizard);
