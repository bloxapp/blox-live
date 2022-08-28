import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { bindActionCreators } from 'redux';
import config from '~app/backend/common/config';
import Tooltip from '~app/common/components/Tooltip';
import useRouting from '~app/common/hooks/useRouting';
import { isVersionHigherOrEqual } from '~app/utils/service';
import { Button, ModalTemplate } from '~app/common/components';
import { Link } from '~app/components/Wizard/components/common';
import { MODAL_TYPES } from '~app/components/Dashboard/constants';
import { openExternalLink } from '~app/components/common/service';
import Connection from '~app/backend/common/store-manager/connection';
import Warning from '~app/components/Wizard/components/common/Warning';
import * as selectors from '~app/components/PasswordHandler/selectors';
import * as actionsFromDashboard from '~app/components/Dashboard/actions';
import * as actionsFromPassword from '~app/components/PasswordHandler/actions';
import * as keyVaultSelectors from '~app/components/KeyVaultManagement/selectors';
import usePasswordHandler from '~app/components/PasswordHandler/usePasswordHandler';
import { Title, Description } from '~app/common/components/ModalTemplate/components';

// @ts-ignore
import imageSrc from '~app/assets/images/info.svg';
// @ts-ignore
import image from '~app/assets/images/pop_up_image.svg';

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
    const keyVaultVersion = Connection.db().get('keyVaultVersion');
    if (isVersionHigherOrEqual(keyVaultVersion, config.env.MERGE_SUPPORTED_TAG)) return showPasswordProtectedDialog(onButtonClick);
    return onButtonClick();
  };

  const onButtonClick = () => {
    setModalDisplay({ show: false, type: MODAL_TYPES.MERGE_COMING });
    goToPage(ROUTES.REWARD_ADDRESSES);
  };

  return (
    <ModalTemplate padding={'48px 60px 57px 71px'} image={image}>
      <Title>The Merge is here!</Title>
      <Description>With the transition to Proof of Stake, validators can now earn fee recipent address.</Description>
      <Description>These rewards will be distributed to a new Ethereum address of your choice.
        <Tooltip interactive title={<LinkTo onClick={() => openExternalLink('', 'https://bloxstaking.com/blog/product-updates/merge-is-here/')}>What are proposal rewards?</LinkTo>} placement={'bottom'}>
          <Image src={imageSrc} />
        </Tooltip>
      </Description>
      <Description>In order to reap these rewards you must provide a fee recipent address for your validators and update your KeyVault.</Description>
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
