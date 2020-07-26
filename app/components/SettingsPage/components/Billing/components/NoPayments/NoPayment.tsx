import React from 'react';
import styled from 'styled-components';
import imageSrc from './no-credit-emptystate.svg';

const Wrapper = styled.div``;

const Image = styled.img`
  margin-bottom: 20px;
`;

const Text = styled.div`
  color: ${({ theme }) => theme.gray800};
  font-size: 14px;
  font-weight: 500;
`;

const Button = styled.div`
  color: ${({ theme }) => theme.primary600};
  font-size: 14px;
  font-weight: 900;
  cursor: pointer;
`;

const NoPayments = () => (
  <Wrapper>
    <Image src={imageSrc} />
    <Text>Billing information is not required for test net users</Text> <br />
    <Button>Upgrade to Main Net</Button>
  </Wrapper>
);

export default NoPayments;
