import React from 'react';
import styled from 'styled-components';
import { Header, Body, Footer } from './components';

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  font-weight: 500;
  border-radius: 8px;
  flex-direction: column;
  background-color: #ffffff;
  color: ${({theme}) => theme.gray800};
  border: solid 1px ${({theme}) => theme.gray300};
`;

const Table = (props: Props) => {
  const {
    data, columns, withHeader, isPagination, selectedSorting,
    sortType, onSortClick, paginationInfo, onPageClick, totalCount,
    navButtonWidth, rowMinHeight, headerHeight, footerHeight } = props;

  return (
    <Wrapper>
      {withHeader && (
        <Header
          columns={columns}
          sortType={sortType}
          height={headerHeight}
          onSortClick={onSortClick}
          selectedSorting={selectedSorting}
        />
      )}
      <Body
        data={data}
        columns={columns}
        rowMinHeight={rowMinHeight}
        totalCount={totalCount || null}
      />
      <Footer
        height={footerHeight}
        onPageClick={onPageClick}
        isPagination={isPagination}
        paginationInfo={paginationInfo}
        navButtonWidth={navButtonWidth}
      />
    </Wrapper>
  );
};

type Props = {
  data: any[];
  totalCount?: number;
  rowMinHeight?: number | string;
  headerHeight?: number | string;
  footerHeight?: number | string;
  columns: any[];
  withHeader: boolean;
  isPagination: boolean;
  selectedSorting?: string;
  sortType?: string;
  onSortClick?: (sortKey: any, direction: any, compareFunction: any) => void;
  paginationInfo: Record<string, any>;
  onPageClick: (offset) => void;
  navButtonWidth?: string;
};

export default Table;
