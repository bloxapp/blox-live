import React from "react";
import styled from "styled-components";
import {Icon} from "../../../../../common/components";


const Wrapper = styled.div`
  width:40px;
  display: flex;
  align-items:center;
  justify-content: space-between;
  color:${({theme}) => theme.primary900};
  font-size:12px;
  cursor:pointer;
`;

const IconWrapper = styled.div`
  transform:rotate(180deg);
`;

const BackButton = (props) => <Wrapper {...props}>
  <IconWrapper>
    <Icon name={'arrow-forward'} color={'primary900'}/>
  </IconWrapper>
  Back
</Wrapper>;

export default BackButton;
