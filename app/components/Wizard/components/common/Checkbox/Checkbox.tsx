import React from 'react';
import styled from 'styled-components';
import { Icon } from 'common/components';

const Wrapper = styled.div<{ checked: boolean }>`
  width:18px;
  height:18px;
  position:relative;
  display:flex;
  align-items:center;
  justify-content:center;
  border:${({theme}) => `${theme.primary900} 1px solid`};
  background-color:${({theme, checked}) => checked ? theme.primary900 : '#ffffff'};
  color:#ffffff;
  border-radius:3px;
  cursor:pointer;
`;

const Checkbox = ({ checked, onClick, style }: Props) => {
  return (
    <Wrapper checked={checked} onClick={() => onClick(!checked)} style={style || {}}>
      <Icon color={'white'} name={'check'} fontSize={'18px'} />
    </Wrapper>
  );
};

type Props = {
  checked: boolean;
  onClick: (checked: boolean) => void;
  style?: any
};

export default Checkbox;
