import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import Box from './Box';
import ReactivatePopper from './ReactivatePopper';
import UpdatePopper from './UpdatePopper';
import * as dashboardActions from '../../../actions';
import { MODAL_TYPES } from '../../../constants';
import usePasswordHandler from '../../../../PasswordHandler/usePasswordHandler';

const Wrapper = styled.div`
  position:relative;
  height:100%;
`;

const BoxWithTooltip = (props) => {
  const { isActive, walletNeedsUpdate, bloxLiveNeedsUpdate, width, color, bigText, medText, tinyText, image, actions } = props;
  const { setModalDisplay } = actions;
  const { checkIfPasswordIsNeeded } = usePasswordHandler();

  const showModal = (type) => {
    let onSuccess = () => setModalDisplay({ show: true, type });
    if (bloxLiveNeedsUpdate) {
      onSuccess = () => setModalDisplay({ show: true, type: MODAL_TYPES.ERROR });
    }
    checkIfPasswordIsNeeded(onSuccess);
  };

  return (
    <Wrapper>
      <Box width={width} color={color} bigText={bigText}
        medText={medText} tinyText={tinyText} image={image}
      />
      {!isActive && (
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
  isActive: PropTypes.bool,
  walletNeedsUpdate: PropTypes.bool,
  bloxLiveNeedsUpdate: PropTypes.bool,
  width: PropTypes.string,
  color: PropTypes.string,
  bigText: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  medText: PropTypes.string,
  tinyText: PropTypes.string,
  image: PropTypes.string,
  actions: PropTypes.object,
};

export default connect(null, mapDispatchToProps)(BoxWithTooltip);
