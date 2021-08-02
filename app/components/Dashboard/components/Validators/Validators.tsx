import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import tableColumns from './tableColumns';
import { Table } from '~app/common/components';
import config from '~app/backend/common/config';
import { SORT_TYPE } from '~app/common/constants';
import { handlePageClick } from '~app/common/components/Table/service';
import * as dashboardSelectors from '~app/components/Dashboard/selectors';
import AddValidatorButtonWrapper from '~app/components/common/Header/components/AddValidatorButtonWrapper';

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

const Validators = ({ accounts, isTestNetShow, showNetworkSwitcher }) => {
  const PAGE_SIZE = 10;
  const [pagedAccounts, setPagedAccounts] = React.useState([]);
  const [paginationInfo, setPaginationInfo] = React.useState(null);
  const [selectedSort, setSelectedSort] = React.useState('key');
  const [sortType, setSortType] = React.useState(SORT_TYPE.DESCENDING);
  const [filteredAccounts, setFilteredAccounts] = React.useState([]);

  React.useEffect(() => {
    if (!accounts?.length) {
      setFilteredAccounts([]);
    } else {
      setFilteredAccounts(accounts.filter((account) => {
        if (!showNetworkSwitcher) {
          return true;
        }
        if (!isTestNetShow) {
          return account.network === config.env.MAINNET_NETWORK;
        }
        return account.network === config.env.PRATER_NETWORK;
      }));
    }
    setPaginationInfo(null);
  }, [accounts, isTestNetShow, showNetworkSwitcher]);

  const onPageClick = (offset) => {
    handlePageClick(filteredAccounts, offset, setPagedAccounts, setPaginationInfo, PAGE_SIZE);
  };

  const onSortClick = (sortKey, direction, compareFunction) => {
    setSelectedSort(sortKey);
    setSortType(direction);
    const sortedAccounts = filteredAccounts.sort((a, b) => compareFunction(a, b, direction));
    const size = Math.min(paginationInfo.offset + paginationInfo.pageSize, sortedAccounts.length);
    setPagedAccounts(sortedAccounts.slice(paginationInfo.offset, size));
  };

  if (paginationInfo == null) {
    onPageClick(0);
    return <Wrapper />;
  }

  if (!filteredAccounts?.length) {
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
      <Table
        columns={tableColumns}
        data={pagedAccounts}
        withHeader
        isPagination
        selectedSorting={selectedSort}
        sortType={sortType}
        onSortClick={onSortClick}
        paginationInfo={paginationInfo}
        onPageClick={onPageClick}
      />
    </Wrapper>
  );
};

Validators.propTypes = {
  accounts: PropTypes.array,
  isTestNetShow: PropTypes.bool,
  showNetworkSwitcher: PropTypes.bool
};

const mapStateToProps = (state) => ({
  isTestNetShow: dashboardSelectors.getTestNetShowFlag(state)
});

export default connect(mapStateToProps, null)(Validators);
