import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  position:relative;
`;

const Element = styled.textarea<{ width: string, error: string }>`
  width: ${({width}) => width || '484px'};
  height: 90px;
  padding:8px 10px;
  border-radius: 4px;
  border: solid 1px ${({theme, error}) => error ? theme.destructive600 : theme.gray300};
  background-color: #ffffff;
  outline:none;
  resize:none;
  :focus {
    border: solid 1px ${({theme, error}) => error ? theme.destructive600 : theme.primary900};
  }
  ::placeholder {
    color:${({theme}) => theme.gray400};
}
`;

const ErrorMessage = styled.span`
  width:100%;
  font-size: 12px;
  font-weight: 900;
  line-height: 1.67;
  color: ${({theme}) => theme.destructive600};
  position:absolute;
  bottom:-15px;
  left:0px;
`;

const Textarea = ({width, value, onChange, error, ...rest}: Props) => {
  const onChangeValue = (e) => {
    e.persist();
    onChange(e.target.value);
  };

  return (
    <Wrapper>
      <Element
        value={value}
        onChange={onChangeValue}
        onPaste={onChangeValue}
        width={width}
        placeholder={'Separate each word with a space'}
        error={error}
        {...rest}
      />
      {error && (<ErrorMessage>{error}</ErrorMessage>)}
    </Wrapper>
  );
};

type Props = {
  width?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  autoFocus?: boolean;
  placeholder?: string;
  isDisabled?: boolean;
  marginTop?: any;
  onBlur?: any;
  onPaste?: any;
};

export default Textarea;
