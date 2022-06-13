import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Sorting from './Sorting';

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  font-size: 12px;
  padding: 0 16px;
  height: ${({height}) => height || '50px'};
  border-bottom: solid 1px ${({theme}) => theme.gray300};
`;

const Cell = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  width: ${({width}) => width};
  border-left:  solid 1px ${({theme}) => theme.gray300};
  &:first-child {
    border-left: 0;
  }
  justify-content:${({justifyContent}) => justifyContent || 'flex-start'};
`;

const Header = ({columns, selectedSorting, sortType, onSortClick, height}) => {
  return (
    <Wrapper
      height={height}
    >
      {columns.map((column, index) => {
        const {key, title, width, justifyContent, compareFunction} = column;
        const withSorting = compareFunction && sortType !== 'disabled';

        if (withSorting) {
          return (
            <Cell
              key={index}
              width={width}
              justifyContent={justifyContent}
            >
              {title}
              <Sorting
                sortKey={key}
                sortType={sortType}
                onSortClick={onSortClick}
                selectedSorting={selectedSorting}
                compareFunction={compareFunction}
              />
            </Cell>
          );
        }

        return (
          <Cell
            key={index}
            width={width}
            justifyContent={justifyContent}
          >
            {title}
          </Cell>
        );
      })}
    </Wrapper>
  );
};

Header.propTypes = {
  columns: PropTypes.array,
  selectedSorting: PropTypes.string,
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  sortType: PropTypes.string,
  onSortClick: PropTypes.func,
};

Header.defaultProps = {
  columns: [],
  selectedSorting: '',
  height: null,
  sortType: 'disabled',
  onSortClick: () => {}
};

export default Header;
