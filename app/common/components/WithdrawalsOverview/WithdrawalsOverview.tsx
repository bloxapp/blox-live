import React from 'react';
import { shell } from 'electron';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import config from '~app/backend/common/config';
import useRouting from '~app/common/hooks/useRouting';
import { SecondaryButton } from '~app/common/components/Modal/Modal';
import Warning from '~app/components/Wizard/components/common/Warning';
import { getWalletSeedlessFlag } from '~app/components/Wizard/selectors';
import { Title, BigButton, Link } from '~app/components/Wizard/components/common';
import usePasswordHandler from '~app/components/PasswordHandler/usePasswordHandler';

const Wrapper = styled.div`
  height: 100%;
  width: 100%;
  margin: 70px auto;
  flex-direction: column;
  background-color: ${({theme}) => theme.gray50};
  max-width: 595px;
`;

const Text = styled.span`
  display: block;
  font-size: 14px;
  font-family: Avenir, serif;
  color: ${({theme}) => theme.gray800};
`;

const SubmitButton = styled(BigButton)`
  width: 238px;
  height: 40px;
  font-size: 16px;
  font-weight: 900;
  line-height: 1.75;
  text-align: center;
  font-style: normal;
  font-stretch: normal;
  padding: 6px 24px 8px;
  letter-spacing: normal;
  color: ${({theme}) => theme.gray50};
  cursor: ${({isDisabled}) => (isDisabled ? 'default' : 'pointer')};
  background-color: ${({ theme, isDisabled }) => isDisabled ? theme.gray400 : theme.primary900};
`;

const WithdrawalsOverview = ({ isSeedless }) => {
  const { goToPage, ROUTES } = useRouting();
  const { checkIfPasswordIsNeeded } = usePasswordHandler();

  const isSeedlessMode = () => {
    // TODO: fake it with false value for testing
    // return false;
    return isSeedless;
  };

  const goToWithdrawalAddresses = async () => {
    return checkIfPasswordIsNeeded(() => goToPage(ROUTES.WITHDRAWAL_ADDRESSES));
  };

  const onCancelButtonClick = () => {
    goToPage(ROUTES.DASHBOARD);
  };

  const learnMoreOnWithdrawalsLinkClick = async () => {
    return shell.openExternal(config.env.WITHDRAWALS_FAQ_LINK);
  };

  return (
    <Wrapper>
      <Title>Withdrawals Overview</Title>
      <Text style={{marginBottom: 32}}>
        Withdrawals enables stakers the ability to receive their validator&apos;s earned rewards or stop running their validator and exit the network.
        &nbsp;
        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
        <Link onClick={learnMoreOnWithdrawalsLinkClick}>Learn more on withdrawals.</Link>
      </Text>

      <Text style={{marginBottom: 32}}>
        There are two types of withdrawals:<br />
        <u>Partial Withdrawals</u> (also known as &quot;skimming&quot;) - an automatic process that happens while your validator continues to be part
        &nbsp;of the Beacon Chain, in which any amount over the principle 32 ETH staked (the rewards accrued to your validator balance on the Beacon Chain)
        &nbsp;will be sent to the validator&apos;s withdrawal address.
      </Text>

      <Text style={{marginBottom: 32}}>
        <u>Full Withdrawals</u> (also known as &quot;exit&quot; or &quot;unstaking&quot;) - an action that causes your validator to exit the network
        &nbsp;and stop being part of the Beacon Chain, in which its entire balance consisting of the 32 ETH principle and accured rewards are unlocked
        &nbsp;from the Beacon Chain and sent to the validator&apos;s withdrawal address.
      </Text>

      <Text style={{marginBottom: 32}}>
        Please note that there is a limit for both partial and full withdrawals, in the form of how many could be processed per each block.
        &nbsp;Withdrawals are processed within a queue, during which validators are required to continue performing their duties, which could
        &nbsp;result in processing delays, depending on the amount of validators in the network.
      </Text>

      <Warning
        style={{marginBottom: 32, maxWidth: 'none', fontSize: 12, padding: 20}}
        text={'Please note that the process of setting a withdrawal address is irreversible and could not be changed in the future.'}
      />

      {isSeedlessMode() ? (
        <Text style={{marginBottom: 32, fontWeight: 'bold'}}>
          Setting a withdrawal address through the Blox app is not supported for users who have imported their validators
          &nbsp;using Keystore files (&quot;Seedless users&quot;) - to learn how to configure this through external tools visit our guide.
        </Text>
      ) : ''}

      <div style={{display: 'flex', alignItems: 'center', alignContent: 'center', justifyContent: 'left', height: 'auto'}}>
        <div
          style={{display: 'flex', minWidth: 200, alignContent: 'center', justifyContent: 'center', marginTop: 'auto'}}
        >
          <SecondaryButton
            style={{fontSize: 16, color: '#047fff', display: 'block', maxWidth: 70}}
            onClick={onCancelButtonClick}
          >
            Cancel
          </SecondaryButton>
        </div>

        {isSeedlessMode() ? (
          <SubmitButton onClick={goToWithdrawalAddresses}>
            Go to Guide ⬈
          </SubmitButton>
        ) : (
          <SubmitButton onClick={goToWithdrawalAddresses}>
            Continue
          </SubmitButton>
        )}
      </div>
    </Wrapper>
  );
};

WithdrawalsOverview.propTypes = {
  isSeedless: PropTypes.bool,
};

const mapStateToProps = (state) => ({
  isSeedless: getWalletSeedlessFlag(state),
});

export default connect(mapStateToProps, null)(WithdrawalsOverview);
