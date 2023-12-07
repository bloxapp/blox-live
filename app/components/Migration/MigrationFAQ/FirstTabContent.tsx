import React from 'react';
import styled from 'styled-components';
import image1 from '../../../assets/images/image12.svg';
import image2 from '../../../assets/images/image13.svg';
import image3 from '../../../assets/images/image14.svg';

const OuterWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 250px;
  height: 190px;
  padding: 15px;
  border-radius: 16px;
  background: #F4F7FA;
`;

const Image = styled.img`
  width: 32px;
  height: 32px;
  margin-bottom: 20px;
`;

const Header = styled.div`
  color: #0792E8;
  font-family: Avenir, sans-serif;
  font-size: 14px;
  font-style: normal;
  font-weight: 900;
  line-height: 20px;
  margin-bottom: 10px;
`;

const Text = styled.div`
  color: #34455A;
  font-family: Avenir, sans-serif;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 24px;
`;

const SingleBlock = ({ img, header, text }: { img: any; header: string; text: string }) => (
  <Wrapper>
    <Image src={img} />
    <Header>{header}</Header>
    <Text>{text}</Text>
  </Wrapper>
);

const FirstTabContent = () => (
  <OuterWrapper>
    <SingleBlock img={image1} header="Easy setup" text="Run a validator without hardware or coordination with simple contract transaction." />
    <SingleBlock img={image2} header="Scalable" text="Supports home stakers and the largest staking applications alike." />
    <SingleBlock img={image3} header="Flexible" text="Hyper configurable setups, swap and change operators supported natively." />
  </OuterWrapper>
);

export default FirstTabContent;
