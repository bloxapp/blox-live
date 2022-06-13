import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import Pagination from './Pagination';

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  height: ${({height}) => height || '50px'};
  border-top: solid 1px ${({theme}) => theme.gray300};
`;

const Footer = ({isPagination, paginationInfo, onPageClick, navButtonWidth, height}) => {
  if (isPagination) {
    return (
      <Wrapper
        height={height}
      >
        <Pagination
          paginationInfo={paginationInfo}
          onPageClick={onPageClick}
          navButtonWidth={navButtonWidth}
        />
      </Wrapper>
    );
  }
  return (
    <Wrapper />
  );
};

Footer.propTypes = {
  isPagination: PropTypes.bool,
  paginationInfo: PropTypes.object,
  onPageClick: PropTypes.func,
  navButtonWidth: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

Footer.defaultProps = {
  isPagination: false,
  paginationInfo: null,
  onPageClick: () => {},
  navButtonWidth: null,
  height: null
};
export default Footer;
