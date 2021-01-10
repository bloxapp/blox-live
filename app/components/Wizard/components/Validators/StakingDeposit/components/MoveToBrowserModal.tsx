import {CustomModal} from "../../../../../../common/components";
import React from "react";
import styled from "styled-components";
import {BigButton} from "../../../common";
import {Icon} from 'common/components';

const InnerWrapper = styled.div`
  width:100%;
  height:100%;
  // display: flex;
  // align-items: center;
  justify-content:center;
`;

const Title = styled.div`
  font-size: 26px;
  font-weight: 900;
  line-height: 1.69;
  margin-top: 54px;
`;

const Info = styled.div`
  margin-left: 130px;
  margin-right: 130px;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.67;
  margin-top: 24px;
  padding: 0px 40px 0px 40px;
`;

const ButtonWrapper = styled.div`
  width:100%;
  margin-top:45px;
  display:flex;
  justify-content:center;
`;

const BottomWrapper = styled.div`
  width:100%;
  display:flex;
  justify-content:center;
  margin-top: 36px
`;

const AuditText = styled.div`
  margin-left: 8px;
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme }) => theme.gray400};
`;

const MoveToBrowserModal = (props: Props) => {
  const {onClose, onMoveToBrowser} = props;
  const [moveToBrowser, setMovedToBrowser] = React.useState(true);

  const moveToBrowserTitle = 'Moving to the Browser';
  const waitingTitle = 'Waiting for Web Confirmation';
  const moveToBrowserDescription = 'You will be taken to a secured Blox Staking webpage to complete the deposit transaction';
  const waitingDescription = 'In case the deposit was completed or if you want to deposit later';
  const moveToBrowserBtn = 'Continue To Staking Deposit';
  const waitingBtn = 'Go to Dashboard';

  return (
    <CustomModal width={'600px'} height={'300px'} onClose={moveToBrowser ? () => onClose(moveToBrowser) : undefined}>
      <InnerWrapper>
        <Title>{moveToBrowser ? moveToBrowserTitle : waitingTitle}</Title>
        <Info>{moveToBrowser ? moveToBrowserDescription : waitingDescription}</Info>
        <ButtonWrapper>
          <BigButton style={{'width': '320px'}} onClick={() => {
            onMoveToBrowser(moveToBrowser);
            setMovedToBrowser(false);
          }}>{moveToBrowser ? moveToBrowserBtn : waitingBtn}</BigButton>
        </ButtonWrapper>
        {/*<BottomWrapper>
          <Icon name={'verified-user'} fontSize={'16px'} color={'gray400'}/>
          <AuditText>Security Audited By</AuditText>
        </BottomWrapper>*/}
      </InnerWrapper>
    </CustomModal>
  );
};

type Props = {
  onClose: (moveToBrowser : boolean) => void;
  onMoveToBrowser: (moveToBrowser : boolean) => void;
};

export default MoveToBrowserModal;
