import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Button } from '../../../common';
import MetaMask from '../../../../../MetaMask';
import * as metaMaskActions from '../../../../../MetaMask/actions';
import * as selectors from '../../../../../MetaMask/selectors';
import saga from '../../../../../MetaMask/saga';
import ButtonInnerWrapper from './ButtonInnerWrapper';
import { useInjectSaga } from '../../../../../../utils/injectSaga';

import metaMaskImage from 'components/Wizard/components/Validators/StakingDeposit/assets/mm-logo.svg';

const metamask = new MetaMask();
const key = 'metaMask';

const MetaMaskButton = (props: Props) => {
  const { isExist, isExistChecked, actions } = props;

  useInjectSaga({ key, saga, mode: '' });

  useEffect(() => {
    if (!isExistChecked) {
      actions.checkIfMetaMaskExist(metamask.isExist());
    }
  }, [isExist, isExistChecked]);

  return (
    <Button
      width="260px"
      height="100px"
      isDisabled={!isExist}
      onClick={actions.sendEthFromMetaMask}
    >
      <ButtonInnerWrapper>
        {' '}
        <img src={metaMaskImage} />{' '}
      </ButtonInnerWrapper>
    </Button>
  );
};

const mapStateToProps = (state: State) => ({
  isLoading: selectors.getIsLoading(state.metaMask),
  isExist: selectors.getIsExistStatus(state.metaMask),
  isExistChecked: selectors.getIsExistCheckedStatus(state.metaMask),
  txHash: selectors.getTxHash(state.metaMask),
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  actions: bindActionCreators(metaMaskActions, dispatch),
});

type Props = {
  isLoading: boolean;
  isExist: boolean;
  isExistChecked: boolean;
  txHash: string;
  actions: Record<string, any>;
};

type State = Record<string, any>;
type Dispatch = (arg0: { type: string }) => any;

export default connect(mapStateToProps, mapDispatchToProps)(MetaMaskButton);
