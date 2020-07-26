import React from 'react';
import styled from 'styled-components';
import { Icon } from 'common/components';
import logo from 'assets/images/staking-logo.svg';

const Wrapper = styled.div`
  width: 60%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const InnerWrapper = styled.div`
  width: 60%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
`;

const Logo = styled.img`
  margin-bottom: 35px;
`;

const Intro = styled.div`
  font-size: 20px;
  font-weight: 500;
  line-height: 1.8;
  color: #f7fcff;
  margin-bottom: 15px;
`;

const PricingLink = styled.a`
  font-size: 11px;
  font-weight: 500;
  line-height: 1.45;
  color: ${(props) => props.theme.gray50};
  text-decoration: underline;
  &:hover {
    color: #ffffff;
  }
  &:active {
    color: ${(props) => props.theme.gray300};
  }
`;

const Bottom = styled.div`
  width: 75%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 150px;
`;

const BottomBox = styled.div`
  width: 28%;
`;

const BottomTitle = styled.div`
  font-size: 12px;
  font-weight: 900;
  line-height: 1.67;
  color: #f7fcff;
  margin-top: 10px;
`;

const BottomText = styled.div`
  font-size: 11px;
  font-weight: 500;
  line-height: 1.45;
  color: #f7fcff;
`;

const Left = () => (
  <Wrapper>
    <InnerWrapper>
      <Logo src={logo} />
      <Intro>
        Scalable infrastructure for ETH 2.0 staking <br />
        and network validators.
      </Intro>
      <PricingLink>See all plans &amp; pricing</PricingLink>
      <Bottom>
        <BottomBox>
          <Icon name="key" fontSize="24px" />
          <BottomTitle>Private Key Management</BottomTitle>
          <BottomText>
            The first non-custodial solution for private keys
          </BottomText>
        </BottomBox>
        <BottomBox>
          <Icon name="protection" fontSize="24px" />
          <BottomTitle>Slash Protection</BottomTitle>
          <BottomText>
            Reduce penalties and slashes with reliable infrastructure
          </BottomText>
        </BottomBox>
        <BottomBox>
          <Icon name="plugnplay" fontSize="24px" />
          <BottomTitle>Plug &amp; Play</BottomTitle>
          <BottomText>
            Blox Staking integrates seamlessly and is built for reliability at
            scale
          </BottomText>
        </BottomBox>
      </Bottom>
    </InnerWrapper>
  </Wrapper>
);

export default Left;
