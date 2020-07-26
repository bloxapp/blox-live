import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Wrapper = styled.div`
  width: 100%;
  height: 168px;
  display: flex;
  justify-content: space-between;
`;

const Box = styled.div`
  width: ${({ width }) => width};
  height: 100%;
  display: flex;
  align-items: center;
  background-color: #ffffff;
  color: ${({ theme, color }) => theme[color]};
  border: 1px solid ${({ theme }) => theme.gray300};
  border-radius: 8px;
  padding: 0px 36px;
`;

const InnerBox = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const BigText = styled.div`
  width: 100%;
  height: 64px;
  font-size: 42px;
  font-weight: 500;
`;

const TinyText = styled.div`
  width: 100%;
  height: 16px;
  font-size: 11px;
  font-weight: 500;
  color: ${({ theme }) => theme.gray600};
`;

const Boxes = (props) => {
  const { isActive, summary } = props;
  return (
    <Wrapper>
      <Box width={'290px'} color={'gray800'}>
        <InnerBox>
          <BigText>{summary.balance}</BigText>
          <TinyText>Total Balance</TinyText>
        </InnerBox>
      </Box>
      <Box width={'260px'} color={'gray800'}>
        <InnerBox>
          <BigText>{summary.sinceStart}</BigText>
          <TinyText>Since Start</TinyText>
        </InnerBox>
      </Box>
      <Box width={'220px'} color={'gray800'}>
        <InnerBox>
          <BigText>{summary.change}%</BigText>
          <TinyText>Change</TinyText>
        </InnerBox>
      </Box>
      <Box width={'330px'} color={isActive ? 'accent2400' : 'destructive700'}>
        <InnerBox>
          <BigText>{isActive ? 'Active' : 'Inactive'}</BigText>
          <TinyText>KeyVault</TinyText>
        </InnerBox>
      </Box>
    </Wrapper>
  );
};

Boxes.propTypes = {
  isActive: PropTypes.bool,
  summary: PropTypes.object,
};

export default Boxes;
