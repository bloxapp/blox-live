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
    sortType, onSortClick, customLoader, paginationInfo, onPageClick, totalCount,
    navButtonWidth, rowMinHeight, headerHeight, footerHeight, withoutColumnBorder, withBlueHover } = props;

  return (
    <Wrapper>
      {withHeader && (
        <Header
          columns={columns}
          sortType={sortType}
          height={headerHeight}
          onSortClick={onSortClick}
          selectedSorting={selectedSorting}
          withoutColumnBorder={withoutColumnBorder}
        />
      )}
      <Body
        data={data}
        columns={columns}
        customLoader={customLoader}
        rowMinHeight={rowMinHeight}
        withBlueHover={withBlueHover}
        totalCount={totalCount || null}
        withoutColumnBorder={withoutColumnBorder}
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
  columns: any[];
  sortType?: string;
  withHeader: boolean;
  totalCount?: number;
  customLoader?: any;
  isPagination: boolean;
  withBlueHover?: boolean;
  navButtonWidth?: string;
  selectedSorting?: string;
  withoutColumnBorder?: boolean;
  onPageClick: (offset) => void;
  rowMinHeight?: number | string;
  headerHeight?: number | string;
  footerHeight?: number | string;
  paginationInfo: Record<string, any>;
  onSortClick?: (sortKey: any, direction: any, compareFunction: any) => void;
};

export default Table;
