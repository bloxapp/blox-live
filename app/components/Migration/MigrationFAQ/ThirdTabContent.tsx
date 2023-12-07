import React from 'react';
import styled from 'styled-components';
import ssvNetwork from '../../../assets/images/ssv-network.svg';
import bloxStaking from '../../../assets/images/bloxstaking.svg';

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  font-family: Avenir,sans-serif;
`;

const LeftPartWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  width: 260px;
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100px;
  height: 75px;
  margin-bottom: 60px;
  color: #0B2A3C;
  font-size: 16px;
  font-style: normal;
  font-weight: 800;
  line-height: normal;
`;

const Image1 = styled.img`
  height: 40px;
  width: 36px;
  margin-bottom: 10px;
`;

const Image2 = styled.img`
  height: 40px;
  width: 29px;
  margin-bottom: 10px;
`;

const LeftPartContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

const LeftPartContentItem = styled.div`
  height: 50px;
  margin-bottom: 30px;
  color: #0CC99B;
  text-align: right;
  font-size: 16px;
  font-style: normal;
  font-weight: 800;
  line-height: 24px;
`;

const VsText = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 160px;
  height: 75px;
  margin-bottom: 60px;
  color: #63768B;
  text-align: center;
  font-size: 40px;
  font-style: normal;
  font-weight: 800;
  line-height: 44px;
`;

const CenterPartWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 160px;
  margin: 0 20px;
`;

const CenterPartContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
`;

const CenterPartContentItem = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  height: 50px;
  margin-bottom: 30px;
  color: #63768B;
  text-align: center;
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  line-height: 24px;
`;

const RightPartWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  width: 260px;
`;

const RightPartContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const RightPartContentItem = styled.div`
  height: 50px;
  margin-bottom: 30px;
  color: #1BA5F8;
  font-size: 16px;
  font-style: normal;
  font-weight: 800;
  line-height: 24px;
`;

const ThirdTabContent = () => (
  <Wrapper>
    <LeftPartWrapper>
      <Header>
        <Image1 src={bloxStaking} />
        <div>Bloxstaking</div>
      </Header>
      <LeftPartContent>
        <LeftPartContentItem>Non-custodial ETH staking solution</LeftPartContentItem>
        <LeftPartContentItem>Validator hosting via desktop app</LeftPartContentItem>
        <LeftPartContentItem>Users retain full control (non-custodial)</LeftPartContentItem>
        <LeftPartContentItem>Validator keys secured in</LeftPartContentItem>
        <LeftPartContentItem>Emphasis on transparency and no reward sharing</LeftPartContentItem>
      </LeftPartContent>
    </LeftPartWrapper>
    <CenterPartWrapper>
      <VsText>VS</VsText>
      <CenterPartContent>
        <CenterPartContentItem>Platform Type</CenterPartContentItem>
        <CenterPartContentItem>Ownership & Control</CenterPartContentItem>
        <CenterPartContentItem>Infrastructure</CenterPartContentItem>
        <CenterPartContentItem>Key Management</CenterPartContentItem>
        <CenterPartContentItem>Community Involvement</CenterPartContentItem>
      </CenterPartContent>
    </CenterPartWrapper>
    <RightPartWrapper>
      <Header>
        <Image2 src={ssvNetwork} />
        <div>SSV Network</div>
      </Header>
      <RightPartContent>
        <RightPartContentItem>Decentralized ETH staking infrastructure</RightPartContentItem>
        <RightPartContentItem>Non-custodial; users have full control over assets </RightPartContentItem>
        <RightPartContentItem>Scalable infrastructure powered by DVT</RightPartContentItem>
        <RightPartContentItem>Keys split into shares for enhanced security</RightPartContentItem>
        <RightPartContentItem>Community-driven, governed by a DAO</RightPartContentItem>
      </RightPartContent>
    </RightPartWrapper>
  </Wrapper>
);

export default ThirdTabContent;
