import React from 'react';
import styled from 'styled-components';
import Icon from '../Icon';

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0px;
  left: 0px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.gray80060};
  z-index:50;
`;

const Content = styled.div`
  width: 600px;
  height: 244px;
  padding: 42px 67px;
  border-radius: 8px;
  box-shadow: 0 12px 24px 0 ${({ theme }) => theme.gray80030};
  background-color: #ffffff;
  color: ${({ theme }) => theme.gray800};
  text-align: center;
  position: relative;
`;

const CloseButton = styled.div`
  position: absolute;
  top: -32px;
  right: -32px;
`;
const Title = styled.h1`
  font-size: 26px;
  font-weight: 900;
  line-height: 1.69;
  margin-bottom: 24px;
`;

const Text = styled.div`
  font-size: 12px;
  font-weight: 500;
  line-height: 1.67;
  margin-bottom: 24px;
`;

const ButtonsWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Button = styled.div`
  width: 180px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 900;
  border-radius: 6px;
  cursor: pointer;
`;

export const PrimaryButton = styled(Button)<{ bgColor: string }>`
  color: #ffffff;
  background-color: ${({ theme, bgColor }) => theme[bgColor]};
`;

export const SecondaryButton = styled(Button)`
  color: ${({ theme }) => theme.gray600};
`;

const Modal = (props: Props) => {
  const { title, text, buttonText, cancelButtonText, buttonColor, onClick, onCloseClick } = props;
  return (
    <Wrapper>
      <Content>
        <CloseButton>
          <Icon name={'close'} onClick={onCloseClick} fontSize={'32px'} color={'#ffffff'} />
        </CloseButton>
        <Title>{title}</Title>
        <Text>{text}</Text>
        <ButtonsWrapper>
          <SecondaryButton onClick={onCloseClick}>{cancelButtonText}</SecondaryButton>
          <PrimaryButton onClick={onClick} bgColor={buttonColor}>
            {buttonText}
          </PrimaryButton>
        </ButtonsWrapper>
      </Content>
    </Wrapper>
  );
};

Modal.defaultProps = {
  title: 'Title',
  text: 'Some text',
  buttonText: 'OK',
  cancelButtonText: 'Cancel',
  buttonColor: 'primary900',
};

type Props = {
  title: string;
  text: string;
  buttonText: string;
  cancelButtonText: string;
  buttonColor: string;
  onClick: () => void;
  onCloseClick: () => void;
};

export default Modal;
