import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { Log } from '~app/backend/common/logger/logger';
import { getProcessNameForUpdate } from '~app/utils/process';
import * as wizardSelectors from '~app/components/Wizard/selectors';
import { PROCESSES } from '~app/components/ProcessRunner/constants';
import Connection from '~app/backend/common/store-manager/connection';
import { ProcessLoader, ModalTemplate } from '~app/common/components';
import useProcessRunner from '~app/components/ProcessRunner/useProcessRunner';
import {
  Title,
  Description,
  SmallText,
  Wrapper
} from '~app/common/components/ModalTemplate/components';
import * as keyVaultSelectors from '~app/components/KeyVaultManagement/selectors';

const logger = new Log('ReinstallingModal');

const LastError = styled.div`
  color: red;
  padding-bottom: 15px;
  font-size: 14px;
`;

const ReinstallingModal = (props: Props) => {
  const { isLoading, processMessage, isDone, isServerActive, processName,
    startProcess, clearProcessState, loaderPercentage, error } = useProcessRunner();
  const {
    title, description, move1StepForward, move2StepsForward, suggestedProcess,
    onClose, image, keyVaultCurrentVersion, keyVaultLatestVersion } = props;
  const [reinstallStarted, startReinstall] = useState(false);
  const [modalTitle, setModalTitle] = useState(title);
  const [modalDescription, setModalDescription] = useState(description);
  const [lastError, setLastError] = useState(error);
  const versionDependentProcessName = getProcessNameForUpdate(keyVaultCurrentVersion, keyVaultLatestVersion);
  const [currentProcessName, setCurrentProcessName] = useState(suggestedProcess ?? versionDependentProcessName);
  const processDefaultMessage = 'Checking KeyVault configuration...';

  const initReinstall = () => {
    startReinstall(true);
    setModalTitle('Reinstalling KeyVault');
    setModalDescription('KeyVault update failed. Trying to reinstall now..');
    clearProcessState();
    startProcess(currentProcessName, processDefaultMessage);
  };

  useEffect(() => {
    const noProcess = !isDone && !isLoading && !processMessage && !processName;

    switch (currentProcessName) {
      case PROCESSES.UPGRADE:
        if (isDone) {
          if (error) {
            setCurrentProcessName(PROCESSES.REINSTALL);
            logger.warn('Upgrade process failed. Asking to reinstall KeyVault..');
            initReinstall();
            return;
          }

          // Default previous flow for upgrade
          clearProcessState();
          isServerActive ? move1StepForward() : move2StepsForward();
          logger.debug('Upgrade process finished.');
          return;
        }

        // Default previous flow for upgrade
        if (noProcess) {
          logger.debug('Starting upgrade process..');
          startProcess(currentProcessName, processDefaultMessage);
        }
        break;
      case PROCESSES.REINSTALL:
        // Default previous flow for reinstall
        if (noProcess && !reinstallStarted) {
          logger.debug('Starting default reinstall process as initial process..');
          // TODO: apply scenario in seedless mode (keystores re-upload)
          startProcess(currentProcessName, processDefaultMessage, { inputData: Connection.db().get('seed') });
          return;
        }
        if (isDone) {
          clearProcessState();
          isServerActive ? move1StepForward() : move2StepsForward();
          logger.debug('Reinstall process finished.');
          return;
        }
        if (error) {
          setLastError(error);
        }
        break;
    }
  }, [isLoading, isDone, processMessage, keyVaultCurrentVersion, keyVaultLatestVersion]);

  return (
    <ModalTemplate onClose={onClose} image={image}>
      <Title>{modalTitle}</Title>
      <Wrapper>
        {modalDescription && <Description>{modalDescription}</Description>}
        {processMessage && <ProcessLoader text={processMessage} precentage={loaderPercentage} />}
        {lastError && (
          <LastError>{lastError}</LastError>
        )}
      </Wrapper>
      <SmallText withWarning />
    </ModalTemplate>
  );
};

type Props = {
  image: string;
  title: string;
  keyVaultCurrentVersion: string;
  keyVaultLatestVersion: string;
  description?: string;
  move1StepForward: () => void;
  move2StepsForward: () => void;
  onClose?: () => void;
  suggestedProcess?: string;
};

const mapStateToProps = (state: State) => ({
  keyVaultCurrentVersion: wizardSelectors.getWalletVersion(state),
  keyVaultLatestVersion: keyVaultSelectors.getLatestVersion(state),
});

type State = Record<string, any>;

export default connect(mapStateToProps, null)(ReinstallingModal);
