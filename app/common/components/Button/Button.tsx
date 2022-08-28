import styled from 'styled-components';

type Props = {
  isDisabled?: boolean;
};

const Button = styled.button<Props>`
  border:0px;
  width: 175px;
  height: 32px;
  display:flex;
  font-size: 14px;
  font-weight: 900;
  border-radius: 6px;
  align-items:center;
  justify-content:center;
  color:${({theme}) => theme.gray50};
  cursor:${({isDisabled}) => isDisabled ? 'default' : 'pointer'};
  background-color: ${({theme, isDisabled}) => isDisabled ? theme.gray400 : theme.primary900};
`;

export default Button;
