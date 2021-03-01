import React from 'react';
import styled from 'styled-components';
import { Header, Body, Footer } from './components';

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  border: solid 1px ${({theme}) => theme.gray300};
  border-radius: 8px;
  font-weight: 500;
  color: ${({theme}) => theme.gray800};
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
          height={headerHeight}
          columns={columns}
          selectedSorting={selectedSorting}
          sortType={sortType}
          onSortClick={onSortClick}
        />
      )}
      <Body
        rowMinHeight={rowMinHeight}
        columns={columns}
        data={data}
        totalCount={totalCount || null}
      />
      <Footer
        height={footerHeight}
        isPagination={isPagination}
        paginationInfo={paginationInfo}
        onPageClick={onPageClick}
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
