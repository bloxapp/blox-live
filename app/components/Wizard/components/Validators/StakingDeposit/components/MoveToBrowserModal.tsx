import React from 'react';
import styled from 'styled-components';
import { CustomModal } from '~app/common/components';
import { BigButton } from '~app/components/Wizard/components/common';

const InnerWrapper = styled.div`
  width:100%;
  height:100%;
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
  padding: 0 40px 0 40px;
`;

const ButtonWrapper = styled.div`
  width:100%;
  margin-top:45px;
  display:flex;
  justify-content:center;
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
    <CustomModal width={'600px'} height={'400px'} onClose={moveToBrowser ? () => onClose(moveToBrowser) : undefined}>
      <InnerWrapper>
        <Title>{moveToBrowser ? moveToBrowserTitle : waitingTitle}</Title>
        <Info>{moveToBrowser ? moveToBrowserDescription : waitingDescription}</Info>
        <ButtonWrapper>
          <BigButton style={{'width': '320px'}} onClick={() => {
            onMoveToBrowser(moveToBrowser);
            setTimeout(() => {
              setMovedToBrowser(false);
            }, 1000);
          }}>{moveToBrowser ? moveToBrowserBtn : waitingBtn}</BigButton>
        </ButtonWrapper>
      </InnerWrapper>
    </CustomModal>
  );
};

type Props = {
  onClose: (moveToBrowser : boolean) => void;
  onMoveToBrowser: (moveToBrowser : boolean) => void;
};

export default MoveToBrowserModal;
