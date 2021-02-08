import React from 'react';
import styled from 'styled-components';
import { Button } from '../../common';
import Title from '../../common/Title';
import theme from '../../../../../theme';
import Icon from '../../../../../common/components/Icon';

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  font-family: Avenir, serif;
  font-size: 16px;
  font-weight: 500;
`;

const ButtonsWrapper = styled.div`
  width: 42vw;
  display: flex;
  justify-content: space-between;
`;

const InnerWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  text-align:center;
`;

const TextWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  text-align:center;
`;

const SubTitle = styled.span`
  font-size: 16px;
  color: ${theme.gray800}
  background-color:${theme.destructive700};
  font-weight: 500;
  line-height: 1.8;
`;

const Sticker = styled.div`
  height: 20px;
  padding: 0px 7px;
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme }) => theme.white};
  background-color: ${({ theme, disabled }) => disabled ? theme.gray400 : theme.accent2600};
  border-top-right-radius: 7px;
  border-top-left-radius: 0px;
  border-bottom-left-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0px;
  right: 0px;
  z-index: 4;
`;

const ImportOrGenerateSeed = (props: Props) => {
  const { setPage } = props;
  const btnWidth = '260px';
  const btnHeight = '100px';
  const btnStyle = { padding: 30 };

  return (
    <Wrapper>
      <Title style={{'marginTop': '64px'}}>Import or Generate Seed</Title>
      <SubTitle style={{'paddingRight': '200px'}}>
        {'Create a new validator with Blox Staking or import the Seed of an existing'}
        <br />
        {'validator from a different source.'}
        <br /><br />
        {'Import is only available for Mainnet Network.'}
      </SubTitle>
      <ButtonsWrapper>
        <Button style={btnStyle} width={btnWidth} height={btnHeight} onClick={() => setPage(5)} direction={'center'}>
          <Icon name="generate-seed-icon" fontSize="38px" color={'plgreen'} />
          <TextWrapper>
            <SubTitle>Generate Seed</SubTitle>
          </TextWrapper>
        </Button>
        <Button style={{ ...btnStyle, marginLeft: 15 }} width={btnWidth} height={btnHeight} border={false} onClick={() => setPage(10)} direction={'center'}>
          <Sticker isDisabled={false}>{'Mainnet Only'}</Sticker>
          <Icon name="cloud-upload" fontSize="38px" color={'primary900'} />
          <InnerWrapper>
            <SubTitle>Import Seed</SubTitle>
          </InnerWrapper>
        </Button>
      </ButtonsWrapper>
    </Wrapper>
  );
};

type Props = {
  page: number;
  setPage: (page: number) => void;
  step: number;
  setStep: (page: number) => void;
  setCloudProvider?: (label: string) => void;
};

export default ImportOrGenerateSeed;
