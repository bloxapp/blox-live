import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Sorting from './Sorting';

const Wrapper = styled.div`
  width: 100%;
  height: ${({height}) => height || '50px'};
  padding: 0 20px;
  display: flex;
  border-bottom: solid 1px ${({theme}) => theme.gray300};
  font-size: 12px;
`;

const Cell = styled.div`
  width: ${({width}) => width};
  height: 100%;
  display: flex;
  align-items: center;
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
              width={width}
              key={index}
              justifyContent={justifyContent}
            >
              {title}
              <Sorting
                sortKey={key}
                selectedSorting={selectedSorting}
                sortType={sortType}
                onSortClick={onSortClick}
                compareFunction={compareFunction}
              />
            </Cell>
          );
        }

        return (
          <Cell
            width={width}
            key={index}
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
