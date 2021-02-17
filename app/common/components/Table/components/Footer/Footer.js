import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import Pagination from './Pagination';

const Wrapper = styled.div`
  width: 100%;
  height: ${({height}) => height || '50px'};
  display: flex;
  align-items: center;
  justify-content: flex-end;
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
  navButtonWidth: PropTypes.oneOfType([PropTypes.string, undefined]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number, undefined])
};
export default Footer;
