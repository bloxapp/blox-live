import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Icon } from 'common/components';

const Wrapper = styled.div`
  width: ${({ width }) => width};
  height: 100%;
  display: flex;
  align-items: center;
  background-color: #ffffff;
  color: ${({ theme, color }) => theme[color]};
  border: 1px solid ${({ theme }) => theme.gray300};
  border-radius: 8px;
  padding: 0 36px;
`;

const InnerWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const MainTextWrapper = styled.div`
  height: 53px;
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  margin-bottom: 10px;
`;

const BigText = styled.div`
  height: 100%;
  font-size: 42px;
  font-weight: 500;
  display:flex;
  align-items:baseline;
`;

const MediumText = styled.div`
  font-size: 20px;
  font-weight: 500;
  display:flex;
  align-items:flex-end;
`;

const TinyText = styled.div`
  width: 100%;
  height: 16px;
  font-size: 11px;
  font-weight: 500;
  color: ${({ theme }) => theme.gray600};
`;

const Image = styled.img`
  width: 100px;
`;

const Box = (props) => {
  const { name, width, color, bigText, medText, tinyText, image } = props;
  return (
    <Wrapper width={width} color={color}>
      <InnerWrapper>
        <MainTextWrapper>
          <BigText>
            {bigText < 0 && '-'}
            {medText && name !== 'change' && (
              <Icon name={'eth-icon-colors'} fontSize={'29px'} color={color} />
            )}
            {bigText < 0 ? Math.abs(bigText) : bigText}
          </BigText>
          {medText && (
            <MediumText>
              {medText}
              {name === 'change' && '%'}
            </MediumText>
          )}
        </MainTextWrapper>
        <TinyText>{tinyText}</TinyText>
      </InnerWrapper>
      {image && <Image src={image} />}
    </Wrapper>
  );
};

Box.propTypes = {
  name: PropTypes.string,
  width: PropTypes.string,
  color: PropTypes.string,
  bigText: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  medText: PropTypes.string,
  tinyText: PropTypes.string,
  image: PropTypes.string,
};

export default Box;
