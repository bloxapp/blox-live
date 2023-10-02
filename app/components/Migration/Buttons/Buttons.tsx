import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  width: 100%;
  height: 70px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 20px 40px 0 40px;
`;

const PrimaryButton = styled.button`
  background-color: #2536B8;
  width: 252px;
  height: 32px;
  border: none;
  color: white;
  cursor: pointer;
  &:hover {
    background-color: #2546b2;
  }
  &:disabled {
    cursor: default;
    background-color: lightgrey;
  }
`;

const SecondButton = styled.p`
  color: #047FFF;
  text-align: center;
  font-family: Avenir;
  font-size: 14px;
  font-style: normal;
  font-weight: 800;
  line-height: 24px;
  cursor: pointer;
`;

const Buttons = ({disabled,
                  acceptAction,
                  cancelAction,
                  acceptButtonLabel,
                  secondButtonLabel}:
                   {disabled?: boolean,
                    acceptAction: () => void,
                    cancelAction: () => void,
                    acceptButtonLabel?: string,
                    secondButtonLabel?: string}) => (
                      <Wrapper>
                        <SecondButton onClick={cancelAction}>{secondButtonLabel || 'Back'}</SecondButton>
                        <PrimaryButton onClick={acceptAction} disabled={disabled}>{acceptButtonLabel || 'Next'}</PrimaryButton>
                      </Wrapper>
  );

export default Buttons;
