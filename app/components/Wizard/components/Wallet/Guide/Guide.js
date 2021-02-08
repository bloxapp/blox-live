import React, { useState } from 'react';
import styled from 'styled-components';
import { Icon } from 'common/components';
import {
  Title, StepsCounter, ContentManager,
  NavigationButtonsWrapper, NavigationButton
} from './components';

const Wrapper = styled.div`
  width:350px;
  height:calc(100% - 70px);
  display:flex;
  position:fixed;
  right:0;
  top:70px;
  padding:24px;
  flex-direction: column;
  background-color: white;
  z-index: 5;
  box-shadow:0 4px 8px 7px rgba(72, 76, 82, 0.05);
`;

const lastPage = 6;

const Guide = () => {
  const [page, setPage] = useState(1);

  const onPrevClick = () => setPage(page - 1);
  const onNextClick = () => setPage(page + 1);

  return (
    <Wrapper>
      <Title>How To Create My AWS &apos;Access Key ID&apos; and &apos;Secret Access Key&apos;</Title>
      <StepsCounter>{page} of {lastPage}</StepsCounter>
      <ContentManager page={page} />
      <NavigationButtonsWrapper>
        <NavigationButton onClick={onPrevClick} show={page > 1}>
          <Icon onClick={onPrevClick} name={'chevron-left'} color={'primary900'} fontSize={'20px'} />
          Previous
        </NavigationButton>
        <NavigationButton onClick={onNextClick} show={page < lastPage}>
          Next
          <Icon onClick={onNextClick} name={'chevron-right'} color={'primary900'} fontSize={'20px'} />
        </NavigationButton>
      </NavigationButtonsWrapper>
    </Wrapper>
  );
};

export default Guide;
