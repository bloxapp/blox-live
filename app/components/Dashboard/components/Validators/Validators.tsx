import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { bindActionCreators } from 'redux';
import { Table } from '~app/common/components';
import { getTableColumns } from './tableColumns';
import { SORT_TYPE } from '~app/common/constants';
import * as accountsAllActions from '~app/components/Accounts/actions';
import { handlePageClick } from '~app/common/components/Table/service';
import * as accountSelectors from '~app/components/Accounts/selectors';
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

const Validators = (props) => {
  const {
    features,
    accounts,
    filteredAccounts,
    isLoadingAccounts,
  } = props;
  const PAGE_SIZE = 10;
  const [sortType, setSortType] = React.useState(SORT_TYPE.DESCENDING);
  const [pagedAccounts, setPagedAccounts] = React.useState([]);
  const [selectedSort, setSelectedSort] = React.useState('key');
  const [paginationInfo, setPaginationInfo] = React.useState(null);

  React.useEffect(() => {
    setPaginationInfo(null);
  }, [accounts, features.isTestNetShow, features.showNetworkSwitcher]);

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

  if (isLoadingAccounts) {
    return <Wrapper />;
  }

  if (paginationInfo === null) {
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
        withHeader
        isPagination
        sortType={sortType}
        withoutColumnBorder
        data={pagedAccounts}
        columns={getTableColumns(features)}
        onSortClick={onSortClick}
        onPageClick={onPageClick}
        selectedSorting={selectedSort}
        paginationInfo={paginationInfo}
      />
    </Wrapper>
  );
};

Validators.propTypes = {
  features: PropTypes.object,
  accounts: PropTypes.array,
  filteredAccounts: PropTypes.any,
  isLoadingAccounts: PropTypes.bool,
};

const mapStateToProps = (state) => ({
  accounts: accountSelectors.getAccounts(state),
  features: dashboardSelectors.getFeatures(state),
  filteredAccounts: accountSelectors.getFilteredAccounts(state),
  isLoadingAccounts: accountSelectors.getAccountsLoadingStatus(state),
});

type Dispatch = (arg0: { type: string, payload?: any }) => any;

const mapDispatchToProps = (dispatch: Dispatch) => ({
  accountsActions: bindActionCreators(accountsAllActions, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(Validators);
