import React from 'react';
import styled from 'styled-components/dist/styled-components.esm';
import ArrowForwardImage from '../../../assets/images/arrow-forward.svg';

const Image = styled.img`
  width: 16px;
  height: 16px;
  margin: 0 6px 2px 2px;
`;

type ArrowButtonProps = {
  disabled: boolean,
  onClick: (event) => void
  arrowType?: ArrowButtonType
};

const ArrowButtonWrapper = styled.button`
  cursor: pointer;
  width: 45px;
  height: 40px;
  margin-left: 4px;
  padding: 4px 6px 4px 7px;
  text-align: center;
  border-radius: 4px;
  background-color: ${({theme, disabled}) => disabled ? theme.gray400 : theme.primary900};
  border: 0;
  color: white;
`;

enum ArrowButtonType {
  right,
  left
}

const ArrowButton = ({ disabled, onClick, arrowType }: ArrowButtonProps) => {
  const arrowImageStyle = { margin: 'auto', width: 32, height: 32 };
  let image = null;

  switch (arrowType) {
    default:
    case ArrowButtonType.right:
      image = ArrowForwardImage;
      break;
    case ArrowButtonType.left:
      break;
  }

  return (
    <ArrowButtonWrapper
      disabled={disabled}
      onClick={onClick}
    >
      <Image src={image} style={arrowImageStyle} />
    </ArrowButtonWrapper>
  );
};

export default ArrowButton;
