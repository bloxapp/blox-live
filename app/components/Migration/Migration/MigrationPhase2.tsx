import {ipcRenderer} from 'electron';
import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import Header from '~app/components/common/Header/Header';
import Content from '~app/components/EntryPage/routes/wrappers/Content';
import {STATUSES} from '../interfaces';
import SsvMigrationService from '~app/backend/services/ssv-migration/ssv-migration.service';
import AccountService from '~app/backend/services/account/account.service';
import VersionService from '~app/backend/services/version/version.service';
import OrganizationService from 'backend/services/organization/organization.service';
import MigrationDownloadFileBtn from '~app/components/Migration/MigrationBlockDownload/MigrationDownloadFileBtn';
import { Wallet, Validators } from '~app/components/Dashboard/components';
import EventLogs from '~app/components/Dashboard/components/EventLogs';
import { Loader } from '~app/common/components';
import useVersions from '~app/components/Versions/useVersions';
import {
  summarizeAccounts,
  normalizeAccountsData,
  normalizeEventLogs
} from '~app/components/Dashboard/service';

const ScreenWrapper = styled.div`
  width: 100%;
  min-height: 100%;
  padding-top: 70px;
  background-color: #f7fcff;
`;

const MigrationPhase2 = () => {
  const [accounts, setAccounts] = useState(null);
  const [accountsSummary, setAccountsSummary] = useState(null);
  const [eventLogs, setEventLogs] = React.useState(null);
  const [keyVaultVersion, setKeyVaultVersion] = useState('');
  const [downloadState, setDownloadState] = useState<STATUSES>(STATUSES.INITIAL);

  const { bloxLiveNeedsUpdate } = useVersions();

  useEffect(() => {
    const loadAccounts = async () => {
      const accountService = new AccountService();
      const fetchedAccounts = await accountService.get();
      setAccountsSummary(summarizeAccounts(fetchedAccounts));
      setAccounts(normalizeAccountsData(fetchedAccounts));
    };
    loadAccounts();
  }, []);

  useEffect(() => {
    const fetchKeyVaultVersion = async () => {
      const versionService = new VersionService();
      const version = await versionService.getKeyVaultVersionFromRemote();
      setKeyVaultVersion(version);
    };
    fetchKeyVaultVersion();
  }, []);

  useEffect(() => {
    const loadEventLog = async () => {
      const orgService = new OrganizationService();
      const fetchedEventLog = await orgService.getEventLogs();
      setEventLogs(normalizeEventLogs(fetchedEventLog));
    };
    loadEventLog();
  }, []);

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
      {/* @ts-ignore */}
      <Header withMenu />
      <Content>
        <ScreenWrapper>
          <Wallet
            isActive={false}
            version={keyVaultVersion}
            isNeedUpdate={bloxLiveNeedsUpdate}
            walletNeedsUpdate={false}
            summary={accountsSummary}
            showNetworkSwitcher={false}
            shouldShowInactiveWarning={false}
          />
          <MigrationDownloadFileBtn downloadState={downloadState} onDownloadClick={handleDownloadClick} />
          {accounts ? <Validators accounts={accounts} showNetworkSwitcher={false} isInteractive={false} /> : <Loader />}
          {eventLogs && <EventLogs events={eventLogs} showNetworkSwitcher={false} />}
        </ScreenWrapper>
      </Content>
    </>
  );
};

export default MigrationPhase2;
