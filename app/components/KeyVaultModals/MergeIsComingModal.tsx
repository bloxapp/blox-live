import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { bindActionCreators } from 'redux';
import imageSrc from '../../assets/images/info.svg';
import Tooltip from '~app/common/components/Tooltip';
import image from '~app/assets/images/pop_up_image.svg';
import { Link } from '../Wizard/components/common';
import * as selectors from '~app/components/PasswordHandler/selectors';
import * as actionsFromDashboard from '~app/components/Dashboard/actions';
import { Button, ModalTemplate } from '~app/common/components';
import * as actionsFromPassword from '~app/components/PasswordHandler/actions';
import { Title, Description } from '~app/common/components/ModalTemplate/components';
import Warning from '../Wizard/components/common/Warning';
import {MODAL_TYPES} from '../Dashboard/constants';
import useRouting from '../../common/hooks/useRouting';
import * as keyVaultSelectors from '../KeyVaultManagement/selectors';
import Connection from '../../backend/common/store-manager/connection';
import usePasswordHandler from '../PasswordHandler/usePasswordHandler';

const Image = styled.img`
  margin-left: 4px;
  width:14px;
`;

const LinkTo = styled(Link)`
  text-decoration: underline;
  color: ${({ theme }) => theme.white};
`;

const MergeIsComing = (props: Props) => {
  const {dashboardActions} = props;
  const { goToPage, ROUTES } = useRouting();
  const { setModalDisplay } = dashboardActions;
  const { checkIfPasswordIsNeeded } = usePasswordHandler();

  /**
   * Show dialog using callback and require password if needed
   */
  const showPasswordProtectedDialog = async (callback) => {
    const cryptoKey = 'temp';
    const isTemporaryCryptoKeyValid = await Connection.db().isCryptoKeyValid(cryptoKey);
    if (isTemporaryCryptoKeyValid) {
      // If temp crypto key is valid - we should set it anyway
      await Connection.db().setCryptoKey(cryptoKey);
    }

    return isTemporaryCryptoKeyValid
      ? callback()
      : checkIfPasswordIsNeeded(callback);
  };

  const passwordProtectedWrapper = () => {
    return showPasswordProtectedDialog(onButtonClick);
  };

  const onButtonClick = () => {
    setModalDisplay({ show: false, type: MODAL_TYPES.MERGE_COMING });
    goToPage(ROUTES.REWARD_ADDRESSES);
  };

  return (
    <ModalTemplate padding={'48px 60px 57px 71px'} image={image}>
      <Title>The Merge is here!</Title>
      <Description>With the transition to Proof of Stake, validators can now earn block proposal rewards.</Description>
      <Description>These rewards will be distributed to a new Ethereum address of your choice.
        <Tooltip interactive title={<LinkTo href={'https://bloxstaking.com/blog/product-updates/merge-is-here/'}>What are proposal rewards?</LinkTo>} placement={'bottom'}>
          <Image src={imageSrc} />
        </Tooltip>
      </Description>
      <Description>In order to reap these rewards you must provide a proposal rewards address for your validators and update your KeyVault.</Description>
      <Warning style={{marginBottom: 44}} text={'Not providing an address could incur potential financial loss in the form of these rewards.'} />
      <Button isDisabled={false} onClick={passwordProtectedWrapper}>Add Addresses</Button>
    </ModalTemplate>
  );
};

type Props = {
  dashboardActions: any,
};

const mapStateToProps = (state) => ({
  isValid: selectors.getPasswordValidationStatus(state),
  isLoading: selectors.getPasswordValidationLoadingStatus(state),
  keyVaultLatestVersion: keyVaultSelectors.getLatestVersion(state),
});

const mapDispatchToProps = (dispatch) => ({
  passwordActions: bindActionCreators(actionsFromPassword, dispatch),
  dashboardActions: bindActionCreators(actionsFromDashboard, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(MergeIsComing);
