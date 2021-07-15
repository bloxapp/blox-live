import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Button } from '../../common';

const Sticker = styled.div`
  height: 20px;
  padding: 0px 7px;
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme }) => theme.gray50};
  background-color: ${({ theme, isDisabled }) => isDisabled ? theme.gray400 : theme.accent2600};
  border-top-right-radius: 7px;
  border-top-left-radius: 0px;
  border-bottom-left-radius: 0px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0px;
  right: 0px;
  z-index: 4;
`;

const ImageWrapper = styled.div`
  width: 157px;
  height: calc(100% - 4px);
  margin: 2px 0px 0px 2px;
  background-color: ${({ theme }) => theme.gray200};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
`;

const TextWrapper = styled.div`
  width: 230px;
  padding: 0px 22px 0px 32px;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
`;

const TitleText = styled.span`
  color: ${({ theme }) => theme.gray800};
  font-size: 16px;
  font-weight: 500;
`;

const CustomButton = (props) => {
  const { width, height, title, image, sticker, onClick, isDisabled, imageWrapperStyle, imageStyle, style } = props;
  return (
    <Button
      width={width}
      height={height}
      onClick={onClick}
      isDisabled={isDisabled}
      style={style ?? {}}
    >
      {sticker && <Sticker isDisabled={isDisabled}>{sticker}</Sticker>}
      <ImageWrapper style={imageWrapperStyle ?? {}}>
        <Image src={image} style={imageStyle ?? {}} />
      </ImageWrapper>
      <TextWrapper>
        <TitleText>{title}</TitleText>
      </TextWrapper>
    </Button>
  );
};

CustomButton.propTypes = {
  width: PropTypes.string,
  height: PropTypes.string,
  title: PropTypes.string,
  image: PropTypes.string,
  sticker: PropTypes.string,
  onClick: PropTypes.func,
  isDisabled: PropTypes.bool,
  style: PropTypes.any,
  imageStyle: PropTypes.any,
  imageWrapperStyle: PropTypes.any,
};

export default CustomButton;
