import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { bindActionCreators } from 'redux';
import { openExternalLink } from '~app/components/common/service';
import { MODAL_TYPES } from '~app/components/Dashboard/constants';
import Connection from '~app/backend/common/store-manager/connection';
import * as dashboardActions from '~app/components/Dashboard/actions';
import Box from '~app/components/Dashboard/components/Wallet/components/Box';
import usePasswordHandler from '~app/components/PasswordHandler/usePasswordHandler';
import UpdatePopper from '~app/components/Dashboard/components/Wallet/components/UpdatePopper';
import ReactivatePopper from '~app/components/Dashboard/components/Wallet/components/ReactivatePopper';

const Wrapper = styled.div`
  position:relative;
  height:100%;
`;

const BoxWithTooltip = (props) => {
  const { isActive, walletNeedsUpdate, bloxLiveNeedsUpdate, width, color, bigText, medText, tinyText, image, actions, shouldShowInactiveWarning } = props;
  const { setModalDisplay } = actions;
  const { checkIfPasswordIsNeeded } = usePasswordHandler();

  const showModal = (type) => {
    let onSuccess = () => setModalDisplay({ show: true, type });
    if (bloxLiveNeedsUpdate && !Connection.db('').get('ignoreNewBloxLiveVersion')) {
      onSuccess = () => setModalDisplay({
        show: true,
        type: MODAL_TYPES.MUST_UPDATE_APP,
        // eslint-disable-next-line jsx-a11y/anchor-is-valid,jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions
        text: <div>You must update Blox app to the <a onClick={() => openExternalLink('download')}>latest version</a> before updating your KeyVault.</div>,
        displayCloseButton: true,
      });
    }
    checkIfPasswordIsNeeded(onSuccess);
  };

  return (
    <Wrapper>
      <Box width={width} color={color} bigText={bigText}
        medText={medText} tinyText={tinyText} image={image}
      />
      {!isActive && shouldShowInactiveWarning && (
        <ReactivatePopper onClick={() => { showModal(MODAL_TYPES.REACTIVATION); }} />
      )}
      {walletNeedsUpdate && isActive && (
        <UpdatePopper onClick={() => { showModal(MODAL_TYPES.UPDATE); }} />
      )}
    </Wrapper>
  );
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(dashboardActions, dispatch),
});

BoxWithTooltip.propTypes = {
  width: PropTypes.string,
  color: PropTypes.string,
  image: PropTypes.string,
  isActive: PropTypes.bool,
  medText: PropTypes.string,
  actions: PropTypes.object,
  tinyText: PropTypes.string,
  walletNeedsUpdate: PropTypes.bool,
  bloxLiveNeedsUpdate: PropTypes.bool,
  bigText: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  shouldShowInactiveWarning: PropTypes.bool
};

export default connect(null, mapDispatchToProps)(BoxWithTooltip);
