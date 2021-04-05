import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  width: 240px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: #ffffff;
  position: absolute;
  top: 24px;
  right: 0px;
  box-shadow: 0px 0px 4px 0px ${({ theme }) => theme.gray80015};
  border-radius: 4px;
  padding-top: 5px;
  padding-bottom: 5px;
`;

const Item = styled.div<{ showOrangeDot: boolean }>`
  width: 100%;
  height: 40px;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  color: ${({ theme, showOrangeDot }) => showOrangeDot ? theme.warning900 : theme.gray800};
  &:hover {
    background-color: ${(props) => props.theme.gray50};
    color: ${({ theme, showOrangeDot }) => showOrangeDot ? theme.warning800 : theme.gray600};
  }
  &:active {
    background-color: ${(props) => props.theme.gray100};
  }
`;

const DropDown = (props: Props) => {
  const { items, style } = props;
  return (
    <Wrapper style={{ ...(style || {}) }}>
      {items.map((item, index) => {
        const { name, onClick, color } = item;
        return (
          <Item onClick={onClick} showOrangeDot={color} key={index}>
            {name}
          </Item>
        );
      })}
    </Wrapper>
  );
};

type Props = {
  items: any[];
  style?: any;
};

export default DropDown;
