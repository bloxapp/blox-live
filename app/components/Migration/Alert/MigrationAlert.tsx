import React from 'react';
import styled from 'styled-components';
import useRouting from '~app/common/hooks/useRouting';
// @ts-ignore
import chevron from '~app/assets/images/chevron-right.svg';
// @ts-ignore
import sunsetting from '~app/assets/images/sunsetting.svg';

const AlertWrapper = styled.div`
  width: 100%;
  height: 84px;
  border-radius: 8px;
  border: 1px solid #2536B8;
  background: #FFF;
  box-shadow: 0px 4px 4px 0px rgba(37, 54, 184, 0.10);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0px 32px 0px 32px;
  margin-bottom: 32px;
`;

const SunsettingWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const SunsettingLogo = styled.div`
  width: 67px;
  height: 69px;
  margin-right: 48px;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  background-image: url(${sunsetting});
`;

const SunsettingTextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
`;

const SunsettingTitle = styled.h1`
  margin: 0;
  color: #2536B8;
  font-family: Avenir;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 24px;
`;

const AdditionalText = styled.p`
  margin: 0;
  color: #7C8087;
  font-family: Avenir;
  font-size: 11px;
  font-style: normal;
  font-weight: 500;
  line-height: 16px;
`;

const LearnMoreButton = styled.div`
  color: #047FFF;
  text-align: right;
  font-family: Avenir;
  font-size: 12px;
  font-style: normal;
  font-weight: 800;
  line-height: 20px;
  cursor: pointer;
  display: flex;
  flex-direction: row;
`;

const ChevronIcon = styled.div`
  width: 15px;
  height: 15px;
  margin: 3px 0px 0px 17px;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  background-image: url(${chevron});
`;

const MigrationAlert = () => {
  const { goToPage, ROUTES } = useRouting();

  const startMigrationFlow = () => {
    goToPage(ROUTES.MIGRATION_FLOW);
  };

  return (
    <AlertWrapper>
      <SunsettingWrapper>
        <SunsettingLogo />
        <SunsettingTextWrapper>
          <SunsettingTitle>Bloxstaking is Sunsetting</SunsettingTitle>
          <AdditionalText>Click to learn why and what you could do with your validators moving forward</AdditionalText>
        </SunsettingTextWrapper>
      </SunsettingWrapper>
      <LearnMoreButton onClick={startMigrationFlow}>
        Learn More
        <ChevronIcon />
      </LearnMoreButton>
    </AlertWrapper>
  );
};

export default MigrationAlert;
