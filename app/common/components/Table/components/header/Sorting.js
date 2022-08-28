import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Icon } from '~app/common/components';
import { SORT_TYPE } from '~app/common/constants';

const Wrapper = styled.div``;

const Sorting = (props) => {
  const { sortKey, selectedSorting, sortType, onSortClick, compareFunction } = props;
  const sortingTypeIcon = sortType === SORT_TYPE.ASCENDING ? 'sorting-up' : 'sorting-down';
  const direction = sortType === SORT_TYPE.ASCENDING ? SORT_TYPE.DESCENDING : SORT_TYPE.ASCENDING;
  return (
    <Wrapper>
      <Icon
        name={selectedSorting === sortKey ? sortingTypeIcon : 'sorting'}
        color={selectedSorting === sortKey ? 'primary800' : 'gray800'}
        fontSize="16px"
        onClick={() => onSortClick(sortKey, direction, compareFunction)}
      />
    </Wrapper>
  );
};

Sorting.propTypes = {
  sortKey: PropTypes.string,
  selectedSorting: PropTypes.string,
  sortType: PropTypes.string,
  onSortClick: PropTypes.func,
  compareFunction: PropTypes.func,
};

export default Sorting;
