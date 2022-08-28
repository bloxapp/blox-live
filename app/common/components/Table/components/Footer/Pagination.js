import PropTypes from 'prop-types';
import {Icon} from '../../../index';
import React from 'react';
import styled from 'styled-components';

const navButtonDefaultWidth = '8%';

const Wrapper = styled.div`
  min-height: 50px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: ${navButtonDefaultWidth};
  :hover {
    color: ${({theme, color}) => (color && theme.primary700) || '#ffffff'};
  }
  :active {
    color: ${({theme, color}) => (color && theme.primary800) || '#ffffff'};
  }
`;

const Button = styled.div`
  width: 100%;
  font-size: 11px;
  border-left: ${({withBorder, theme}) => withBorder ? `solid 1px ${theme.gray300}` : ''} ;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({theme, color}) => theme[color]};
  cursor:${({clickable}) => clickable ? 'pointer' : 'default'};
`;

export const PaginationAction = {
  FIRST: 'first',
  PREVIEW: 'preview',
  NEXT: 'next',
  LAST: 'last'
};

const Pagination = ({paginationInfo, onPageClick, navButtonWidth}) => {
  const pageLength = (paginationInfo.offset) + paginationInfo.pageSize;
  const navButtonStyle = {
    width: navButtonWidth || navButtonDefaultWidth
  };
  const paginationButtons = [
    {
      type: 'page',
      color: 'gray600',
      reverse: true,
      clickable: false,
      withBorder: false,
      title: `${paginationInfo.offset + 1} ~ ${Math.min(pageLength, paginationInfo.total)} of ${paginationInfo.total}`
    },
    {
      type: PaginationAction.FIRST,
      title: 'First',
      reverse: true,
      withBorder: true,
      icon: 'first-page',
      clickable: paginationInfo.offset > 0,
      color: `${paginationInfo.offset > 0 ? 'primary900' : 'gray400'}`,
      iconColor: `${paginationInfo.offset > 0 ? 'primary900' : 'gray400'}`
    },
    {
      type: PaginationAction.PREVIEW,
      title: 'Prev',
      reverse: true,
      withBorder: true,
      icon: 'chevron-left',
      clickable: paginationInfo.offset > 0,
      color: `${paginationInfo.offset > 0 ? 'primary900' : 'gray400'}`,
      iconColor: `${paginationInfo.offset > 0 ? 'primary900' : 'gray400'}`
    },
    {
      type: PaginationAction.NEXT,
      title: 'Next',
      reverse: false,
      withBorder: true,
      icon: 'chevron-right',
      clickable: pageLength < paginationInfo.total,
      color: `${pageLength < paginationInfo.total ? 'primary900' : 'gray400'}`,
      iconColor: `${pageLength < paginationInfo.total ? 'primary900' : 'gray400'}`
    },
    {
      type: PaginationAction.LAST,
      title: 'Last',
      reverse: false,
      withBorder: true,
      icon: 'last-page',
      clickable: pageLength < paginationInfo.total,
      color: `${pageLength < paginationInfo.total ? 'primary900' : 'gray400'}`,
      iconColor: `${pageLength < paginationInfo.total ? 'primary900' : 'gray400'}`
    }
  ];

  const onPaginationClick = (key) => {
    let offset = null;
    switch (key) {
      case PaginationAction.FIRST:
        offset = 0;
        break;
      case PaginationAction.PREVIEW:
        offset = Math.max(0, paginationInfo.offset - paginationInfo.pageSize);
        break;
      case PaginationAction.NEXT:
        offset = Math.min(paginationInfo.total, paginationInfo.offset + paginationInfo.pageSize);
        break;
      case PaginationAction.LAST: {
        const totalPages = Math.ceil(paginationInfo.total / paginationInfo.pageSize);
        offset = paginationInfo.pageSize * ((totalPages - 1));
        break;
      }
    }
    onPageClick(offset);
  };

  return (
    paginationButtons.map(({type, title, icon, iconColor, color, reverse, clickable, withBorder}, index) => {
      return reverse ? (
        <Wrapper
          key={index}
          onClick={() => clickable ? onPaginationClick(type) : false}
          style={navButtonStyle}
        >
          <Button color={color} withBorder={withBorder} clickable={clickable}>
            <Icon
              name={icon}
              color={iconColor}
              fontSize="16px"
            />
            {title}
          </Button>
        </Wrapper>
      ) : (
        <Wrapper
          key={index}
          onClick={() => clickable ? onPaginationClick(type) : false}
          style={navButtonStyle}
        >
          <Button color={color} withBorder={withBorder} clickable={clickable}>
            {title}
            <Icon
              name={icon}
              color={iconColor}
              fontSize="16px"
            />
          </Button>
        </Wrapper>
      );
    })
  );
};

Pagination.propTypes = {
  paginationInfo: PropTypes.shape({
    offset: PropTypes.number,
    pageSize: PropTypes.number,
    total: PropTypes.number,
  }),
  onPageClick: PropTypes.func
};

export default Pagination;
