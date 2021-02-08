import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { normalizeCellsWidth } from '../service';

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const Row = styled.div`
  width: 100%;
  min-height: 70px;
  padding: 0px 20px;
  display: grid;
  grid-template-columns: ${({ gridTemplateColumns }) => gridTemplateColumns};
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.gray300};
  &:last-child {
    border-bottom: 0px;
  }
`;

const Cell = styled.div`
  display: flex;
  justify-content:${({justifyContent}) => justifyContent || 'flex-start'};
`;

const NoDataRow = styled.div`
  width: 100%;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Body = ({ data, columns, totalCount }) => (
  <Wrapper>
    {(!data || data.length === 0) && <NoDataRow>No Data</NoDataRow>}

    {data &&
      data.length > 0 &&
      data.map((item, dataIndex) => {
        const gridTemplateColumns = normalizeCellsWidth(columns)
          .toString()
          .replace(/,/gi, ' ');
        return (
          <Row key={dataIndex} gridTemplateColumns={gridTemplateColumns}>
            {columns.map((column, index) => (
              <Cell key={index} justifyContent={column.justifyContent}>
                {column.valueRender(item[column.key], totalCount)}
              </Cell>
            ))}
          </Row>
        );
      })}
  </Wrapper>
);

Body.propTypes = {
  data: PropTypes.array,
  columns: PropTypes.array,
  totalCount: PropTypes.number
};

export default Body;
