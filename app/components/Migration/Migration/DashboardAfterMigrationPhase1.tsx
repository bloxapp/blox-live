import {ipcRenderer} from 'electron';
import React, {useState} from 'react';
import styled from 'styled-components';
import Header from '~app/components/common/Header/Header';
import Content from '~app/components/EntryPage/routes/wrappers/Content';
// import Dashboard from '~app/components/Dashboard/Dashboard';
import {STATUSES} from '../interfaces';
import SsvMigrationService from '~app/backend/services/ssv-migration/ssv-migration.service';
import MigrationDownloadFileBtn from '~app/components/Migration/MigrationBlockDownload/MigrationDownloadFileBtn';

const ScreenWrapper = styled.div`
  width: 100%;
  min-height: 100%;
  padding-top: 70px;
  background-color: #f7fcff;
`;

const DashboardAfterMigrationPhase1 = () => {
  const [downloadState, setDownloadState] = useState<STATUSES>(STATUSES.INITIAL);

  const ssvMigrationService = new SsvMigrationService();
  const handleDownload = (filePath: string) => {
    ipcRenderer.send('download-file', filePath);

    ipcRenderer.once('download-file-response', (_event, args) => {
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
        // TODO: Handle the error, e.g., show a notification to the user
        console.error('File download error:', args.error);
      }
    });
  };

  const handleDownloadClick = () => {
    setDownloadState(STATUSES.IN_PROGRESS);
    try {
      handleDownload(ssvMigrationService.userMigrationFile);
      setDownloadState(STATUSES.COMPLETE);
    } catch (error) {
      // Handle any download errors
      console.error('Download Error:', error);
      setDownloadState(STATUSES.INITIAL);
    }
  };

  return (
    <>
      <Header withMenu />
      <Content>
        <ScreenWrapper>
          <MigrationDownloadFileBtn downloadState={downloadState} onDownloadClick={handleDownloadClick} />
        </ScreenWrapper>
      </Content>
    </>
  );
};

export default DashboardAfterMigrationPhase1;
