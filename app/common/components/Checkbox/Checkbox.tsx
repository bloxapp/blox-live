import React from 'react';
import { Icon } from 'common/components';
import styled from 'styled-components/dist/styled-components.esm';

const Wrapper = styled.div<{ checked: boolean, disabled?: boolean }>`
  width:18px;
  height:18px;
  position:relative;
  display:flex;
  align-items:center;
  justify-content:center;

  border:${({ theme, disabled }) => {
    if (disabled) {
      return `${theme.gray400} 1px solid`;
    }
    return `${theme.primary900} 1px solid`;
  }};

  background-color:${({ theme, checked, disabled }) => {
    if (disabled) {
      return theme.gray400;
    }
    return checked ? theme.primary900 : '#ffffff';
  }};

  color:#ffffff;
  border-radius:3px;
  cursor:pointer;
`;

type CheckboxProps = {
  checked: boolean;
  disabled?: boolean;
  onClick: (checked: boolean) => void;
  style?: any
};

const Checkbox = ({ checked, onClick, style, disabled }: CheckboxProps) => {
  return (
    <Wrapper
      disabled={disabled}
      checked={checked}
      onClick={() => !disabled && onClick(!checked)}
      style={style || {}}
    >
      <Icon color={'white'} name={'check'} fontSize={'18px'} />
    </Wrapper>
  );
};

const CheckboxWrapper = styled.div`
  width: 100%;
  margin-top: 15px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
`;

type RequiredCheckboxProps = {
  checked: boolean,
  disabled?: boolean,
  onClick: (event) => void,
  checkboxStyle?: object,
  labelStyle?: object,
  children: any
};

const RequiredCheckbox = ({ checked, onClick, checkboxStyle, labelStyle, children, disabled }: RequiredCheckboxProps) => {
  return (
    <CheckboxWrapper>
      <Checkbox
        disabled={disabled}
        checked={checked}
        onClick={onClick}
        style={checkboxStyle || {}}
      />
      <div
        role="checkbox"
        tabIndex={-1}
        style={labelStyle || {}}
        onClick={(event) => { !disabled && onClick(event); }}
        onKeyDown={(event) => {
          if (event.keyCode === 0 || event.keyCode === 32) {
            return !disabled && onClick(event);
          }
        }}
        aria-checked={checked}
      >
        {children}
      </div>
    </CheckboxWrapper>
  );
};

export default RequiredCheckbox;
