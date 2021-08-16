import React from 'react';
import styled from 'styled-components';
import Icon from '~app/common/components/Icon';
import { INPUT_TYPES, ICON_FONT_SIZE } from './constants';

const Wrapper = styled.div<{ width: string }>`
  width:${({width}) => width || '220px'};
  height:70px;
  display:flex;
  flex-direction:column;
  justify-content:space-between;
  position:relative;
`;

const Label = styled.label``;

const TextField = styled.input<{ error: string }>`
  height: 36px;
  color:${({theme, disabled}) => disabled ? theme.gray400 : theme.gray600};
  font-size: 12px;
  font-weight: 500;
  border-radius: 4px;
  border: solid 1px ${({theme, error}) => error ? theme.destructive600 : theme.gray300};
  padding:8px 32px 8px 12px;
  outline: none;
  &:focus {
    border: solid 1px ${({theme, error}) => error ? theme.destructive600 : theme.primary900};
  }
`;

const ErrorMessage = styled.span`
  font-size: 12px;
  font-weight: 900;
  line-height: 1.67;
  color: ${({theme}) => theme.destructive600};
  position:absolute;
  bottom:${({title}) => title ? '-27px' : '10px'};
`;

const IconWrapper = styled.div`
  width:25px;
  height:35px;
  position:absolute;
  top:${({title}) => title ? '36px' : '3px'};
  right:0px;
  cursor:pointer;
  display:flex;
  align-items:center;
`;

const PasswordInput = (props: Props) => {
  const { name, width, title, onChange, onBlur, value, isDisabled, isValid, error, ...rest } = props;
  const [type, setType] = React.useState(INPUT_TYPES.PASSWORD);
  const eyeIconColor = type === INPUT_TYPES.PASSWORD ? 'gray400' : 'gray800';

  const toggleType = () => {
    if (isDisabled) {
      return;
    }
    type === INPUT_TYPES.PASSWORD ? setType(INPUT_TYPES.TEXT) : setType(INPUT_TYPES.PASSWORD);
  };

  const onInputChange = (e) => {
    e.persist();
    onChange(String(e.target.value).replace(/^\s+|\s+$/g, ''));
  };

  return (
    <Wrapper width={width}>
      {title && <Label htmlFor={name}>{title}</Label>}
      <TextField
        id={name}
        type={type}
        value={value}
        onPaste={onInputChange}
        onChange={onInputChange}
        disabled={isDisabled}
        onBlur={onBlur}
        {...rest}
        error={error}
      />
      <IconWrapper onClick={toggleType} title={title}>
        {isValid ? (
          <Icon name={'check'} fontSize={ICON_FONT_SIZE} color={'accent2400'} />
        ) : (
          <Icon name={'eye'} fontSize={ICON_FONT_SIZE} color={eyeIconColor} />
        )}
      </IconWrapper>

      {error && (<ErrorMessage title={title}>{error}</ErrorMessage>)}
    </Wrapper>
  );
};

type Props = {
  name: string;
  type?: string;
  value: string;
  title?: string;
  width?: string;
  error?: string;
  autoFocus?: any
  isValid?: boolean;
  isDisabled?: boolean;
  onFocus?: () => void;
  onBlur?: (event: any) => void;
  onChange: (value: string) => void;
  onKeyDown?: (event: Record<string, any>) => void;
};

export default PasswordInput;
