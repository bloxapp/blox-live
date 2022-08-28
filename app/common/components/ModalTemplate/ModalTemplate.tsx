/* eslint-disable no-nested-ternary */
import React from 'react';
import styled from 'styled-components';
import { CustomModal } from '~app/common/components';

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  position: fixed;
  z-index: 51;
`;

const InnerWrapper = styled.div`
  width:100%;
  height:100%;
  display:flex;
  min-height: inherit;
`;

const Left = styled.div<{ padding: string, justifyContent: string, width?: string | number }>`
  width: ${({ width }) => width ? (Number.isInteger(width) ? `${width}px` : width) : '500px'};
  height: 100%;
  padding:${({padding}) => padding};
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content:${({justifyContent}) => justifyContent};
  text-align: left;
`;

const Right = styled.div`
  width: 300px;
  height: auto;
  background-color: ${({theme}) => theme.gray100};
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom-right-radius: 8px;
  border-top-right-radius: 8px;
  margin-left: auto;
  margin-right: 0;
`;

const Image = styled.img`
  width:200px;
`;

const ModalTemplate = ({width, height, padding, justifyContent, onClose, image, children}: Props) => {
  const leftWidth = width ? (parseInt(width, 10) - 300) : undefined;
  return (
    <Wrapper>
      <CustomModal width={width} height={height} onClose={onClose}>
        <InnerWrapper>
          <Left padding={padding} justifyContent={justifyContent} width={leftWidth}>
            {children}
          </Left>
          <Right>
            <Image src={image} />
          </Right>
        </InnerWrapper>
      </CustomModal>
    </Wrapper>
  );
};

ModalTemplate.defaultProps = {
  width: '800px',
  height: 'auto',
  padding: '90px 32px 90px 64px',
  justifyContent: 'space-between',
};

type Props = {
  width: string;
  height: string;
  padding: string;
  justifyContent: string;
  onClose?: () => void | null;
  image: string;
  children: React.ReactNode;
};

export default ModalTemplate;
