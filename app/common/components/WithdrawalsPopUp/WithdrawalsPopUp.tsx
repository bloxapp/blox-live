import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { Icon } from 'common/components';
import { bindActionCreators } from 'redux';
import config from '~app/backend/common/config';
import useRouting from '~app/common/hooks/useRouting';
import useAccounts from '~app/components/Accounts/useAccounts';
import { MODAL_TYPES } from '~app/components/Dashboard/constants';
import * as dashboardSelectors from '~app/components/Dashboard/selectors';
import * as actionsFromDashboard from '~app/components/Dashboard/actions';
import useNetworkSwitcher from '~app/components/Dashboard/components/NetworkSwitcher/useNetworkSwitcher';

const TextWrapper = styled.div`
  display: flex;
  margin-left: 48px;
  align-self: center;
  flex-direction: column;
`;

const FirstSectionWrapper = styled.div`
  display: flex;
`;

const BlueText = styled.span`
  color: #2536b8;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.71;
  font-style: normal;
  font-stretch: normal;
  letter-spacing: normal;
`;

const LinkText = styled.span`
  font-size: 12px;
  font-weight: 900;
  line-height: 1.67;
  font-style: normal;
  align-self: center;
  font-stretch: normal;
  letter-spacing: normal;
  color: ${({theme}) => theme.primary600};
`;

const SubText = styled.span`
  font-size: 11px;
  font-weight: 500;
  text-align: left;
  line-height: 1.45;
  font-style: normal;
  font-stretch: normal;
  letter-spacing: normal;
  color: ${({theme}) => `solid 1px ${theme.primary600}`};
`;

const Wrapper = styled.div`
  height: 84px;
  display: flex;
  cursor: pointer;
  border-radius: 8px;
  align-items: center;
  margin-bottom: 32px;
  padding: 9px 32px 6px;
  background-color: #ffffff;
  justify-content: space-between;
  &:hover {
    box-shadow: 0 4px 4px 0 rgba(37, 54, 184, 0.1);
  }
  border: ${({theme}) => `solid 1px ${theme.primary900}`};
`;

const WithdrawalsPopUp = ({ features, dashboardActions }) => {
  const { accounts } = useAccounts();
  const { goToPage, ROUTES } = useRouting();
  const { setTestNetShowFlag } = useNetworkSwitcher();
  const editWithdrawalAddress = () => {
    goToPage(ROUTES.WITHDRAWAL_ADDRESSES);
  };

  React.useEffect(() => {
    const mainnetValidators = accounts.find(
      (validator: any) => {
        return !validator.feeRecipient && validator.network === config.env.MAINNET_NETWORK;
      }
    );
    // TODO: what is the logic for show merge popup?? calculate it in accounts saga where all features calculated
    if (features.showMergePopUp && mainnetValidators !== undefined) {
      setTestNetShowFlag(false);
      dashboardActions.setModalDisplay({
        show: true,
        type: MODAL_TYPES.MERGE_COMING,
      });
      dashboardActions.setFeatures({
        showMergePopUp: true,
      });
    }
  });

  return (
    <Wrapper onClick={editWithdrawalAddress}>
      <FirstSectionWrapper>
        <Icon color={'gray50'} name={'discord-symbol'} fontSize={'67px'} />
        <TextWrapper>
          <BlueText>Withdrawals are here!</BlueText>
          <SubText>Stakers are now enabled to withdraw earned rewards from the Beacon Chain or exit the
            network.</SubText>
        </TextWrapper>
      </FirstSectionWrapper>
      <LinkText>Set withdrawal address</LinkText>
    </Wrapper>
  );
};

WithdrawalsPopUp.propTypes = {
  features: PropTypes.object,
  dashboardActions: PropTypes.any,
};

const mapStateToProps = (state) => ({
  features: dashboardSelectors.getFeatures(state),
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  dashboardActions: bindActionCreators(actionsFromDashboard, dispatch)
});

type Dispatch = (arg0: { type: string }) => any;

export default connect(mapStateToProps, mapDispatchToProps)(WithdrawalsPopUp);
