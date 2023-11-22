import React, {useState} from 'react';
import {shell} from 'electron';
import styled from 'styled-components';
// @ts-ignore
import bloxToSsv from '~app/assets/images/blox-to-ssv.svg';
// @ts-ignore
import discordIcon from '~app/assets/images/discord-icon.svg';
import FooterWithButtons from '../../FooterWithButtons/FooterWithButtons';
import Checkbox from '~app/common/components/Checkbox/Checkbox';
// @ts-ignore
import ssvBackground from '~app/assets/images/ssv-background.svg';
import {AdditionalText, Layout} from '~app/components/Migration/styles';
import {PreparationTitle} from '~app/components/Migration/Preparation/styles';

const SsvLayout = styled(Layout)`
  background-size: 260px 365px;
  background-position: top right;
  background-repeat: no-repeat;
  background-image: url(${ssvBackground});
`;

const AssistanceAlert = styled.div`
  display: flex;
  width: 780px;
  padding: 12px 16px;
  align-items: center;
  gap: 33px;
  border-radius: 12px;
  background:  #F4F7FA;
  justify-content: space-between;
`;

const AssistanceAlertTextContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const AssistanceTitle = styled.p`
  color: #0792E8;
  font-family: Avenir, sans-serif;
  font-size: 14px;
  font-style: normal;
  font-weight: 800;
  line-height: 162%;
`;

const ContactUsOnDiscord = styled.div`
  display: flex;
  padding: 12px 26px 12px 16px;
  justify-content: center;
  align-items: center;
  gap: 16px;
  border-radius: 8px;
  border: 1px solid  #E6EAF7;
  background:  #FDFEFE;
  cursor: pointer;
`;

const DiscordIcon = styled.div`
  width: 24px;
  height: 24px;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  background-image: url(${discordIcon});
  margin-right: 10px;
`;

const BloxToSSV = styled.div`
  width: 279px;
  height: 124px;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  background-image: url(${bloxToSsv});
  margin: 40px auto 40px auto;
`;

const WarningAlertContainer = styled.div`
  display: flex;
  width: 780px;
  padding: 12px 16px;
  align-items: center;
  border-radius: 2px;
  border: 1px solid #FFD20A;
  background: rgba(255, 210, 10, 0.20)
`;

const ThirdStep = ({goToNexStep, cancelHandler}: {goToNexStep: () => void, cancelHandler: () => void}) => {
  const [checked, setChecked] = useState(false);

  const checkboxHandler = () => {
    const result = !checked;
    setChecked(result);
  };

  return (
    <div>
      <SsvLayout>
        <PreparationTitle>
          You’re all ready!
        </PreparationTitle>
        <AdditionalText>
          Proceed with the migration to secure your validators on the SSV Network.
        </AdditionalText>
        <AssistanceAlert>
          <AssistanceAlertTextContainer>
            <AssistanceTitle>
              Need Assistance or Have Questions?
            </AssistanceTitle>
            <AdditionalText style={{width: '462px'}}>
              Our team is here to guide you through the process and ensure a smooth transition.
            </AdditionalText>
          </AssistanceAlertTextContainer>
          <ContactUsOnDiscord onClick={() => shell.openExternal('https://discord.com/invite/ssvnetworkofficial')}>
            <DiscordIcon />
            Contact us On Discord
          </ContactUsOnDiscord>
        </AssistanceAlert>
        <BloxToSSV />
        <WarningAlertContainer>
          Upon migration initiation your bloxstaking validator will be shut down and will stop attesting, make sure to complete the migration process properly in order to minimize validator downtime
        </WarningAlertContainer>
        <Checkbox checkboxStyle={{marginRight: 8}} checked={checked} onClick={checkboxHandler}>I understand that by initiating the migration process my validators will be shut down and will stop accuring rewards</Checkbox>
      </SsvLayout>
      <FooterWithButtons disabled={!checked} acceptAction={goToNexStep} cancelAction={cancelHandler} acceptButtonLabel={'Start Migration'} />
    </div>
  );
};

export default ThirdStep;
