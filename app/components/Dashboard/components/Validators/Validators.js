import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Table } from 'common/components';
import tableColumns from './tableColumns';
import { SORT_TYPE } from 'common/constants';
import { handlePageClick } from 'common/components/Table/service';
import AddValidatorButtonWrapper from '../../../common/Header/components/AddValidatorButtonWrapper';

const Wrapper = styled.div`
  width: 100%;
  margin-bottom:36px;
`;

const NoValidatorsText = styled.div`
  color: ${({theme}) => theme.gray600};
  display: inline-block;
`;

const AddValidatorButton = styled.button`
  border: solid 1px ${({theme}) => theme.gray400};
  background-color: transparent;
  color: ${({theme}) => theme.primary900};
  margin-left: 10px;
  border-radius: 6px;
  font-family: Avenir, serif;
  font-size: 11px;
  font-weight: 500;
  width: 114px;
  height: 28px;
  cursor: pointer;
`;

const Title = styled.h1`
  font-size: 26px;
  font-weight: 500;
  line-height: 1.69;
  color: ${({theme}) => theme.gray800};
  margin-top: 0;
  margin-bottom: 20px;
`;

const Validators = ({accounts}) => {
  const PAGE_SIZE = 10;
  const [pagedAccounts, setPagedAccounts] = React.useState([]);
  const [paginationInfo, setPaginationInfo] = React.useState(null);
  const [selectedSort, setSelectedSort] = React.useState('key');
  const [sortType, setSortType] = React.useState(SORT_TYPE.DESCENDING);

  const onPageClick = (offset) => {
    handlePageClick(accounts, offset, setPagedAccounts, setPaginationInfo, PAGE_SIZE);
  };

  const onSortClick = (sortKey, direction, compareFunction) => {
    setSelectedSort(sortKey);
    setSortType(direction);
    const sortedAccounts = accounts.sort((a, b) => compareFunction(a, b, direction));
    const size = Math.min(paginationInfo.offset + paginationInfo.pageSize, sortedAccounts.length);
    setPagedAccounts(sortedAccounts.slice(paginationInfo.offset, size));
  };

  if (paginationInfo == null) {
    onPageClick(0);
    return <Wrapper />;
  }

  if (!accounts || !accounts.length) {
    const addValidatorButtonWrapperStyle = { display: 'inline-block' };
    return (
      <Wrapper>
        <Title>Validators</Title>
        <NoValidatorsText>There are no validators to show at the moment</NoValidatorsText>
        <AddValidatorButtonWrapper style={addValidatorButtonWrapperStyle}>
          <AddValidatorButton>Add Validator</AddValidatorButton>
        </AddValidatorButtonWrapper>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <Title>Validators</Title>
      <Table columns={tableColumns} data={pagedAccounts} withHeader isLoading={false} isPagination
        selectedSorting={selectedSort} sortType={sortType} onSortClick={onSortClick}
        paginationInfo={paginationInfo} onPageClick={onPageClick} />
    </Wrapper>
  );
};

Validators.propTypes = {
  accounts: PropTypes.array,
};

export default Validators;
