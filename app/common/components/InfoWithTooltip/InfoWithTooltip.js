import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import imageSrc from 'assets/images/info.svg';
import Tooltip from '../Tooltip';

const Image = styled.img`
  width: 13px;
  height: 13px;
  margin: 0px 6px 2px 2px;
`;

const InfoWithTooltip = ({ title, placement }) => (
  <Tooltip title={title} placement={placement}>
    <Image src={imageSrc} />
  </Tooltip>
);

InfoWithTooltip.propTypes = {
  title: PropTypes.string,
  placement: PropTypes.string,
};

export default InfoWithTooltip;
