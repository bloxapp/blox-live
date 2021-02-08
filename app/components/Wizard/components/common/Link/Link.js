import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.a`
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme }) => theme.primary900};
  font-family: Avenir, serif;
  &:hover {
    color: ${({ theme }) => theme.primary700};
  }
`;

const Link = (props) => <Wrapper {...props} target={'_blank'} />;

export default Link;
