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
  display: grid;
  padding: 0 16px;
  align-items: center;
  min-height: ${({ minHeight }) => minHeight || '70px'};
  border-bottom: 1px solid ${({ theme }) => theme.gray300};
  grid-template-columns: ${({ gridTemplateColumns }) => gridTemplateColumns};
  &:hover {
    background-color: ${({ theme, withBlueHover }) => withBlueHover ? theme.gray50 : ''};
    box-shadow:  ${({ withBlueHover }) => withBlueHover ? '0 4px 4px 0 rgba(0, 0, 0, 0.04)' : ''}
  }
  &:last-child {
    border-bottom: 0;
  }
`;

const Cell = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  padding-right: 8px;
  border-left:  ${props => props.withoutColumnBorder ? '' : `solid 1px ${props.theme.gray300}`};
  &:first-child {
    border-left: 0;
  }
  &:last-child {
    padding-right: 0;
  }
  justify-content:${({justifyContent}) => justifyContent || 'flex-start'};
`;

const NoDataRow = styled.div`
  width: 100%;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Body = ({ data, columns, totalCount, rowMinHeight, customLoader, withoutColumnBorder, withBlueHover }) => {
  return (
    <Wrapper>
      {(!data || data.length === 0) && (customLoader ?? <NoDataRow>No Data</NoDataRow>)}

      {data &&
      data.length > 0 &&
      data.map((row, dataIndex) => {
        const gridTemplateColumns = normalizeCellsWidth(columns)
          .toString()
          .replace(/,/gi, ' ');
        return (
          <Row
            key={dataIndex}
            minHeight={rowMinHeight}
            withBlueHover={withBlueHover}
            gridTemplateColumns={gridTemplateColumns}
          >
            {columns.map((column, index) => (
              <Cell withoutColumnBorder={withoutColumnBorder} key={index} justifyContent={column.justifyContent}>
                {column.valueRender(row[column.key], totalCount, row, dataIndex)}
              </Cell>
            ))}
          </Row>
        );
      })}
    </Wrapper>
);
};

Body.propTypes = {
  data: PropTypes.array,
  columns: PropTypes.array,
  totalCount: PropTypes.number,
  customLoader: PropTypes?.any,
  withBlueHover: PropTypes.bool,
  withoutColumnBorder: PropTypes.bool,
  rowMinHeight: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

Body.defaultProps = {
  data: [],
  columns: [],
  totalCount: 0,
  withBlueHover: false,
  rowMinHeight: undefined,
  customLoader: undefined,
  withoutColumnBorder: false,
};

export default Body;
