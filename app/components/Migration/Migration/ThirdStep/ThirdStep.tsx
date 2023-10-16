import { ipcRenderer } from 'electron';

import React, {useState} from 'react';
import styled from 'styled-components';
import {Layout, Title} from '~app/components/Migration/styles';
import Buttons from '~app/components/Migration/Buttons/Buttons';
// @ts-ignore
import MigrationBlockDownload from '~app/components/Migration/MigrationBlockDownload/MigrationBlockDownload';
import SsvMigrationService from '~app/backend/services/ssv-migration/ssv-migration.service';

const MigrationBlocksContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const ThirdStep = ({nextStep, cancelHandler}: {nextStep: () => void, cancelHandler: () => void}) => {
  const [downloadState, setDownloadState] = useState('initial'); // 'initial', 'inProgress', 'completed'

  const ssvMigrationService = new SsvMigrationService();

  const handleDownload = (filePath) => {
    ipcRenderer.send('download-file', filePath);

    ipcRenderer.once('download-file-response', (event, args) => {
      if (args.success) {
        // Handle the file content, e.g., save it to a blob and then use
        // a link element to trigger a download in the renderer process
        const blob = new Blob([args.content], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'migration-keyshares.json';
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
      } else {
        // Handle the error, e.g., show a notification to the user
        console.error('File download error:', args.error);
      }
    });
  };

  const handleDownloadClick = () => {
    try {
      setDownloadState('inProgress');
      handleDownload(ssvMigrationService.userMigrationFile);
      setDownloadState('completed');
    } catch (error) {
      // Handle any download errors
      console.error('Download Error:', error);
      setDownloadState('initial');
    }
  };

  return (
    <div>
      <Title>Download Migration Data</Title>
      <Layout>
        <MigrationBlocksContainer>
          <MigrationBlockDownload
            title="Migration Data"
            text="Please download the migration data for your records."
            downloadState={downloadState}
            onDownloadClick={handleDownloadClick}
          />
        </MigrationBlocksContainer>
      </Layout>
      <Buttons
        acceptAction={nextStep}
        cancelAction={cancelHandler}
        acceptButtonLabel="Register Validators"
        disabled={downloadState !== 'completed'}
        showBackButton={false}
      />
    </div>
  );
};

export default ThirdStep;
