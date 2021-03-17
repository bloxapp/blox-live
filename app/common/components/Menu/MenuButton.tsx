import styled from 'styled-components';

export default styled.div`
  display: inline-flex;
  text-decoration: none;
  user-select: none;
  cursor: pointer;
  outline: 0;
  font-size: 14px;
  font-weight: 500;
  padding: 8px 16px;
  color: ${(props) => props.theme.primary600};
  &:hover {
    background-color: ${(props) => props.theme.gray50};
  }
  &:active {
    background-color: ${(props) => props.theme.gray100};
  }
`;
