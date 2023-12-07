import React, { useState } from 'react';
import styled from 'styled-components';
import FooterWithButtons from '../FooterWithButtons/FooterWithButtons';
import useRouting from '~app/common/hooks/useRouting';
import FirstTabContent from './FirstTabContent';
import SecondTabContent from './SecondTabContent';
import ThirdTabContent from './ThirdTabContent';

const OuterWrapper = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  height: 100%;
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  width: 850px;
  padding-top: 40px;
  font-family: Avenir,sans-serif;
`;

const Header = styled.div`
  font-size: 26px;
  font-weight: 800;
  line-height: 44px;
  color: #0B2A3C;
  margin-bottom: 20px;
  padding-left: 20px;
`;

const InnerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 30px;
  margin-bottom: 30px;
  background-color: #FFFFFF;
`;

const TabButtonsWrapper = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 40px;
`;

const TabButton = styled.div<{ isActive: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 250px;
  height: 40px;
  border-radius: 8px;
  border: 1px solid ${({ isActive }) => isActive ? '#49B6F9' : '#E6EAF7'};
  background: ${({ isActive }) => isActive ? '#E8F6FE' : '#F8FCFF'};
  cursor: pointer;
  font-size: 16px;
  font-style: normal;
  font-weight: 800;
  line-height: 24px;
  color: ${({ isActive }) => isActive ? '#1BA5F8' : '#97A5BA'};
`;

const ContentWrapper = styled.div`
  display: flex;
`;

const MigrationFAQ = ({ changeToNextFlow }: { changeToNextFlow: () => void }) => {
  const [activeSection, setActiveSection] = useState(0);

  const { goToPage, ROUTES } = useRouting();

  const tabClickHadler = ({ tabNumber }: { tabNumber: number }) => {
    setActiveSection(tabNumber);
  };

  return (
    <OuterWrapper>
      <Wrapper>
        {/* eslint-disable-next-line react/no-unescaped-entities */}
        <Header>We're excited for the new journey ahead 😊</Header>
        <InnerWrapper>
          <TabButtonsWrapper>
            <TabButton isActive={activeSection === 0} onClick={() => tabClickHadler({ tabNumber: 0 })}>Have you heard of SSV?</TabButton>
            <TabButton isActive={activeSection === 1} onClick={() => tabClickHadler({ tabNumber: 1 })}>FAQ</TabButton>
            <TabButton isActive={activeSection === 2} onClick={() => tabClickHadler({ tabNumber: 2 })}>Blox Stacking vs SSV Network</TabButton>
          </TabButtonsWrapper>
          <ContentWrapper>
            {activeSection === 0 && <FirstTabContent />}
            {activeSection === 1 && <SecondTabContent />}
            {activeSection === 2 && <ThirdTabContent />}
          </ContentWrapper>
        </InnerWrapper>
        <FooterWithButtons acceptAction={changeToNextFlow} acceptButtonLabel={'Proceed to Migration'} cancelAction={() => goToPage(ROUTES.DASHBOARD)} secondButtonLabel={'I\'ll do it later'} />
      </Wrapper>
    </OuterWrapper>
  );
};

export default MigrationFAQ;
