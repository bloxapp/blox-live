import React from 'react';
import { shell } from 'electron';
import styled from 'styled-components';

import { ProcessLoader, Button, PasswordInput, InfoWithTooltip } from 'common/components';
import { Title, Paragraph, ErrorMessage } from '../../common';

import useCreateServer from 'common/hooks/useCreateServer';
import Guide from '../Guide';

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  font-family: Avenir, serif;
  font-size: 16px;
  font-weight: 500;
`;

const PasswordInputsWrapper = styled.div`
  width:570px;
  height: 100px;
  display: flex;
  justify-content:space-between;
  font-size: 16px;
  font-weight: 500;
`;

const ProgressWrapper = styled.div`
  width:58%;
  margin-top:20px;
`;

const GuideButton = styled.span`
  color:${({theme}) => theme.primary900};
  cursor:pointer;
`;

const ExternalLink = styled.span`
  color:${({theme}) => theme.primary900};
  cursor:pointer;
  &:hover {
    color:${({theme}) => theme.primary600};
  }
`;

const moreInfo = `
  * AWS offers a 12 months free tier following your initial sign-up date to AWS.
  In most cases, we built it in a way that the free tier should be enough,
  but in some cases small charges may apply. Want to learn more? visit our discord channel.
`;

const CreateServer = (props: Props) => {
  const { page, setPage } = props;
  const [showGuide, setGuideDisplay] = React.useState(true);

  const onSuccess = () => setPage(page + 1);

  const { isLoading, error, processMessage, loaderPercentage, accessKeyId, setAccessKeyId,
          secretAccessKey, setSecretAccessKey, onStartProcessClick, isPasswordInputDisabled, isButtonDisabled
        } = useCreateServer({onSuccess});

  return (
    <Wrapper>
      <Title>Create your Staking KeyVault</Title>
      <Paragraph>
        We will now create a KeyVault on AWS free tier* <InfoWithTooltip title={moreInfo} placement={'right'} /> <br />
        Blox needs to have access to your AWS access/secret tokens.
        <br /> <br />

        <b>Important</b>: make sure your&nbsp;
        <ExternalLink onClick={() => shell.openExternal('https://aws.amazon.com/premiumsupport/knowledge-center/create-and-activate-aws-account/')}>
          AWS account is verified
        </ExternalLink> before creating the keys. <br />
        To create a suitable server and access tokens follow this&nbsp;
        <GuideButton onClick={() => setGuideDisplay(true)}>step-by-step guide</GuideButton>.
      </Paragraph>
      <PasswordInputsWrapper>
        <PasswordInput name={'accessKeyId'} title={'Access Key ID'} autoFocus
          onChange={setAccessKeyId} value={accessKeyId} isDisabled={isPasswordInputDisabled}
        />
        <PasswordInput name={'secretAccessKey'} title={'Secret Access Key'} width={'320px'}
          onChange={setSecretAccessKey} value={secretAccessKey} isDisabled={isPasswordInputDisabled}
        />
      </PasswordInputsWrapper>
      <Button isDisabled={isButtonDisabled} onClick={() => onStartProcessClick('install')}>Continue</Button>
      {isLoading && processMessage && !error && (
        <ProgressWrapper>
          <ProcessLoader text={processMessage} precentage={loaderPercentage} />
        </ProgressWrapper>
      )}
      {error && (
        <ErrorMessage>
          {error}, please try again.
        </ErrorMessage>
      )}
      {showGuide && <Guide onClose={() => setGuideDisplay(false)} />}
    </Wrapper>
  );
};

type Props = {
  page: number;
  setPage: (page: number) => void;
};

export default CreateServer;
