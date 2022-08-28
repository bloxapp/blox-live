import React from 'react';
import styled from 'styled-components';
import { InfoWithTooltip } from '~app/common/components';

const Wrapper = styled.div`
  width:100%;
  height: 100px;
  // display: flex;
  align-items: top;
  background: ${({theme}) => theme.white};
  border: solid 1px ${({theme}) => theme.gray300};
  border-radius: 8px;
  padding-left: 25px;
  padding-bottom: 16px;
  // padding-top: 16px;
  margin-top: 24px;
`;

const InnerWrapper = styled.div`
  width:100%;
  height: 80%;
  display: flex;
  align-items: center;
`;

const StepNumber = styled.div`
    width:10%;
    font-size: 16px;
    font-weight: 900;
    // margin-bottom: 20px;
    color: ${({theme}) => theme.primary900};
`;

const LeftWrapper = styled.div`
    width:30%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding-top: 10px;
    // padding-bottom: 24px;
`;

const BigTitle = styled.span`
    font-size: 32px;
    font-weight: 800;
    color: ${({theme, color}) => theme[color] || theme.gray800};
    display:flex;
    line-height: 30px;
    height: 30px;
    align-items:baseline;
`;

const MediumTitle = styled.div`
    font-size: 18px;
    font-weight: 500;
    color: ${({theme, color}) => theme[color] || theme.gray800};
    margin-left: 4px;
    // height: 100%;
    display:flex;
    align-items:flex-end;
`;

const SmallTitle = styled.div`
    font-size: 12px;
    font-weight: 500;
    color: ${({theme, color}) => theme[color] || theme.gray500};
    margin-left: 4px;
    // height: 100%;
    display:flex;
  margin-top: 5px;
    align-items:flex-end;
`;

const HintTitle = styled.div`
    height: 12px;
    font-size: 12px;
    font-weight: 500;
    color: ${({theme, color}) => theme[color] || theme.gray600};
    display: flex;
`;

const InfoWrapper = styled.div`
    width:95%;
    margin-left: 5px;
    align-items: bottom;
`;

const BigInfoTitle = styled.div`
    text-align: start;
    font-size: 16px;
    font-weight: 900;
    color: ${({theme, color}) => theme[color] || theme.primary900};
`;

const ActionWrapper = styled.div`
    width:10%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const TagWrapper = styled.div`
  width:100%;
  height: 20%;
  display: flex;
  justify-content: flex-end;
`;

const FreeTag = styled.div`
    // width:40px;
    height: 20px;
    background: ${({theme}) => theme.accent2600};
    border-bottom-left-radius:4px;
    border-top-right-radius:8px;
    display: flex;
    text-align: center;
    font-size: 12px;
    font-weight: 900;
    padding: 0 7px;
    color: ${({theme, color}) => theme[color] || theme.gray50};
`;

const DepositStepData = (props: Props) => {
  const {step, title, tag, hint, amount, token, tooltip, children, amountOfValidators} = props;
  return (
    <Wrapper>
      <TagWrapper>
        <FreeTag style={{'padding': tag ? '0 7px' : '0'}}>{tag}</FreeTag>
      </TagWrapper>
      <InnerWrapper>
        <StepNumber>{step}</StepNumber>
        <LeftWrapper>
          <BigTitle>{amount} <MediumTitle>{token}</MediumTitle></BigTitle>
          {amountOfValidators > 1 && <SmallTitle>x{amountOfValidators} Validators</SmallTitle>}
          <HintTitle style={{textDecorationLine: 'line-through', textDecorationStyle: 'solid'}}>{hint ? '0.5 ETH' : ''}</HintTitle>
        </LeftWrapper>
        <InfoWrapper>
          <BigInfoTitle>{title}</BigInfoTitle>
          {children}
        </InfoWrapper>
        {tooltip && (
        <ActionWrapper>
          <InfoWithTooltip title={tooltip} placement="bottom" />
        </ActionWrapper>
      )}
      </InnerWrapper>
    </Wrapper>
  );
};

type Props = {
  step?: number;
  title?: string;
  tag?: string;
  hint?: boolean;
  amount?: number;
  token?: string;
  tooltip?: string;
  children: React.ReactNode;
  amountOfValidators?: number;
};

export default DepositStepData;
