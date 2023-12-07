import React from 'react';
import styled from 'styled-components';
import { Accordion, AccordionSummary, AccordionDetails } from '@material-ui/core';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  font-family: Avenir, sans-serif;
`;

const SubHeader = styled.div`
  color: #34455A;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 24px;
  margin-bottom: 25px;
`;

const Text = styled.div`
  color: #0792E8;
  font-feature-settings: 'clig' off, 'liga' off;
  font-family: Avenir, sans-serif;
  font-size: 14px;
  font-style: normal;
  font-weight: 800;
`;

const Text1 = styled.div`
  color: var(--gray-6, #34455A);
  font-feature-settings: 'clig' off, 'liga' off;
  font-family: Avenir, sans-serif;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
`;

const AccordionWrapper = styled(Accordion)`
  &:before {
    background-color: transparent !important;
  }
`;

const accStyle = { borderRadius: '12px', background: '#F4F7FA', padding: '16px', marginBottom: '20px', boxShadow: 'none' };
const accInnerStyle = { minHeight: 0, padding: 0 };

const SecondTabContent = () => (
  <Wrapper>
    <SubHeader>Have a question about Secret Shared Validators? Find the answers to Frequently Asked Questions about SSV here.</SubHeader>
    <AccordionWrapper style={accStyle}>
      <AccordionSummary style={accInnerStyle}><Text>What is SSV?</Text></AccordionSummary>
      <AccordionDetails><Text1>Secret Shared Validators (SSV) is the first secure and robust way to split an Ethereum validator key between non-trusting nodes run by operators. The nodes do not need to trust each other to carry out their validator duties, and a certain number can be offline without affecting validator performance. No single node can sign data on behalf of a validator, yet not all are needed to create a valid signature, adding fault tolerance to the staking ecosystem. The result is a reliable, decentralized, secure staking solution for Ethereum. Learn more about how SSV works under the hood in the SSV Tech Deep Dive.</Text1></AccordionDetails>
    </AccordionWrapper>
    <AccordionWrapper style={accStyle}>
      <AccordionSummary style={accInnerStyle}><Text>What is ssv.network?</Text></AccordionSummary>
      <AccordionDetails><Text1>Secret Shared Validators (SSV) is the first secure and robust way to split an Ethereum validator key between non-trusting nodes run by operators. The nodes do not need to trust each other to carry out their validator duties, and a certain number can be offline without affecting validator performance. No single node can sign data on behalf of a validator, yet not all are needed to create a valid signature, adding fault tolerance to the staking ecosystem. The result is a reliable, decentralized, secure staking solution for Ethereum. Learn more about how SSV works under the hood in the SSV Tech Deep Dive.</Text1></AccordionDetails>
    </AccordionWrapper>
    <AccordionWrapper style={accStyle}>
      <AccordionSummary style={accInnerStyle}><Text>Why was ssv.network created?</Text></AccordionSummary>
      <AccordionDetails><Text1>Secret Shared Validators (SSV) is the first secure and robust way to split an Ethereum validator key between non-trusting nodes run by operators. The nodes do not need to trust each other to carry out their validator duties, and a certain number can be offline without affecting validator performance. No single node can sign data on behalf of a validator, yet not all are needed to create a valid signature, adding fault tolerance to the staking ecosystem. The result is a reliable, decentralized, secure staking solution for Ethereum. Learn more about how SSV works under the hood in the SSV Tech Deep Dive.</Text1></AccordionDetails>
    </AccordionWrapper>
    <AccordionWrapper style={accStyle}>
      <AccordionSummary style={accInnerStyle}><Text>Who benefits from SSV?</Text></AccordionSummary>
      <AccordionDetails><Text1>Secret Shared Validators (SSV) is the first secure and robust way to split an Ethereum validator key between non-trusting nodes run by operators. The nodes do not need to trust each other to carry out their validator duties, and a certain number can be offline without affecting validator performance. No single node can sign data on behalf of a validator, yet not all are needed to create a valid signature, adding fault tolerance to the staking ecosystem. The result is a reliable, decentralized, secure staking solution for Ethereum. Learn more about how SSV works under the hood in the SSV Tech Deep Dive.</Text1></AccordionDetails>
    </AccordionWrapper>
    <AccordionWrapper style={accStyle}>
      <AccordionSummary style={accInnerStyle}><Text>Who can use ssv.network?</Text></AccordionSummary>
      <AccordionDetails><Text1>Secret Shared Validators (SSV) is the first secure and robust way to split an Ethereum validator key between non-trusting nodes run by operators. The nodes do not need to trust each other to carry out their validator duties, and a certain number can be offline without affecting validator performance. No single node can sign data on behalf of a validator, yet not all are needed to create a valid signature, adding fault tolerance to the staking ecosystem. The result is a reliable, decentralized, secure staking solution for Ethereum. Learn more about how SSV works under the hood in the SSV Tech Deep Dive.</Text1></AccordionDetails>
    </AccordionWrapper>
  </Wrapper>
);

export default SecondTabContent;
