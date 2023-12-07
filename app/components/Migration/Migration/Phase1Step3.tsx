import {ipcRenderer} from 'electron';

import React, {useState} from 'react';
import {useDispatch} from 'react-redux';
import styled from 'styled-components';
import {Layout, Title} from '../styles';
import FooterWithButtons from '../FooterWithButtons/FooterWithButtons';
import MigrationDownloadFileBtn from '../MigrationBlockDownload/MigrationDownloadFileBtn';
import SsvMigrationService from '../../../backend/services/ssv-migration/ssv-migration.service';
import {STATUSES} from '../interfaces';
import UsersService, {SSVMigrationStatus} from '../../../backend/services/users/users.service';
import {updateUserInfoInStore} from '../../User/actions';

const MigrationBlocksContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const BlockWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  background-color: var(--gray-1, #F4F7FA);
  width: 756px;
  padding: 16px;
  border-radius: 12px;
`;

const ContentWrapper = styled.div`
  flex: 1; // This will make it take up all available vertical space
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  margin-right: 25px;
`;

const Subheader = styled.div`
  color:  #0792E8;
  font-feature-settings: 'clig' off, 'liga' off;
  font-size: 14px;
  font-style: normal;
  font-weight: 800;
  line-height: 162%;
  margin-bottom: 15px;
`;

const Text = styled.div`
  color: #34455A;
  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  line-height: 26px;
`;

const Phase1Step3 = () => {
  const dispatch = useDispatch();

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

  const handleFinishedMigrationPhase1 = async () => {
    const usersService = UsersService.getInstance();
    await usersService.update({ migrationStatus: SSVMigrationStatus.DOWNLOADED_KEYSHARES });
    dispatch(updateUserInfoInStore({ migrationStatus: SSVMigrationStatus.DOWNLOADED_KEYSHARES }));
  };

  return (
    <>
      <Title>Download Migration Data</Title>
      <Layout>
        <MigrationBlocksContainer>
          <BlockWrapper>
            <ContentWrapper>
              <Subheader>Download Migration File</Subheader>
              <Text>Your migration is ready, make sure to download the file and store properly you will need it for registering your validators.</Text>
            </ContentWrapper>
            <MigrationDownloadFileBtn downloadState={downloadState} onDownloadClick={handleDownloadClick} />
          </BlockWrapper>
        </MigrationBlocksContainer>
      </Layout>
      <FooterWithButtons
        acceptAction={downloadState === STATUSES.COMPLETE ? handleFinishedMigrationPhase1 : () => {}}
        acceptButtonLabel="Register Validators"
        disabled={downloadState !== STATUSES.COMPLETE}
      />
    </>
  );
};

export default Phase1Step3;
