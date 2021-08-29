import React from 'react';
import styled from 'styled-components';
import Icon from '~app/common/components/Icon';

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.gray80060};
  z-index:50;
`;

const Content = styled.div<ContentProps>`
  width: ${({width}) => Number.isInteger(width) ? `${width}px` : width};
  height: ${({height}) => Number.isInteger(height) ? `${height}px` : height};
  border-radius: 8px;
  box-shadow: 0 12px 24px 0 ${({ theme }) => theme.gray80030};
  background-color: #ffffff;
  color: ${({ theme }) => theme.gray800};
  text-align: center;
  position: relative;
  //min-height: 600px;
`;

const CloseButton = styled.div`
  position: absolute;
  top: -32px;
  right: -32px;
`;

const CustomModal = (props: Props) => {
  const { children, width, height, onClose } = props;
  return (
    <Wrapper>
      <Content width={width} height={height}>
        {onClose && (
          <CloseButton>
            <Icon name="close" onClick={onClose} fontSize="32px" />
          </CloseButton>
        )}
        {children}
      </Content>
    </Wrapper>
  );
};

type Props = {
  children: React.ReactNode;
  width: string | number;
  height: string | number;
  onClose?: () => void;
};

type ContentProps = {
  width: string | number;
  height: string | number;
};

export default CustomModal;
