import React from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import {
  FileDecode,
  FileDecodeFailure,
  FileDecodeSuccess,
  RemoveFileButton
} from '~app/common/components/DropZone/components/FileDecode';

const SelectedFilesTableContainer = styled.table`
  width: 100%;
  overflow-y: scroll;
  display: block;
  border: 1px solid rgba(195, 200, 207, 1);

  &:first-child {
    margin-top: 15px;
    border-bottom: 0;
  }
`;

const TableIndex = styled.td`
  text-align: center;
  padding: 10px !important;
  border-right: 1px solid rgba(195,200,207, 0.6);;
  -webkit-background-clip: padding-box; /* for Safari */
  background-clip: padding-box;
`;

const RowRemove = styled.td`
  text-align: right;
`;

const FileTail = styled.tr`
  border-bottom-color: rgba(195, 200, 207, 1);
  border-top: none;
  border-left: none;
  border-right: none;
  border-width: 1px;
  border-bottom-style: solid;
  height: 40px;
  background-color: white;
  width: 100%;
  overflow: hidden;

  &:last-child {
    border-bottom: none;
  }

  & > td {
    padding-left: 15px;
    padding-right: 15px;
  }

  &:not(:first-child) {
    border-top-width: 0;
  }

  &.validators-list {
    & > td {
      &:first-child {
        min-width: 40px;
        max-width: 40px;
        width: 40px;
      }

      &:last-child {
        min-width: 90px;
        max-width: 90px;
        width: 90px;
        text-align: left;
        padding: 0 0 0 7px;
      }
    }
  }
`;

export type RemoveFileDataType = {
  file: any,
  fileIndex: number
};

type SelectedFilesTableProps = {
  style?: any;
  keyStores?: any[];
  isDecryptingKeyStores?: boolean;
  onRemoveFile?: (fileData: RemoveFileDataType) => void;
};

export const SelectedFilesTable = (props: SelectedFilesTableProps) => {
  const { isDecryptingKeyStores, keyStores, onRemoveFile, style } = props;

  if (!keyStores?.length) {
    return <></>;
  }

  /**
   * Remove file callback
   * @param fileData
   */
  const onRemoveFileClick = (fileData: RemoveFileDataType) => {
    if (!isDecryptingKeyStores) {
      onRemoveFile && onRemoveFile(fileData);
    }
  };

  return (
    <SelectedFilesTableContainer style={style ?? {}}>
      <tbody style={{ width: '100%', display: 'inline-table' }}>
        {keyStores ? keyStores.map((file: any, fileIndex: number) => {
          return (
            <FileTail key={fileIndex}>
              <TableIndex key="file-index">
                {fileIndex + 1}
              </TableIndex>
              <td key="file-progress">
                <FileDecode status={file?.status} />
              </td>
              <td key="file-name">
                {file.name}
              </td>
              <RowRemove key="file-delete">
                <RemoveFileButton onClick={() => {
                  onRemoveFileClick({ file, fileIndex });
                }} />
              </RowRemove>
            </FileTail>
          );
        }) : ''}
      </tbody>
    </SelectedFilesTableContainer>
  );
};

export const longStringShorten = (key: string, friction: number = 10) => {
  return `${key.substr(0, friction)}...${key.substr(key.length - friction, friction)}`;
};

type RecoverFilesTableProps = {
  style?: any;
  accounts: any[];
  decryptedKeyStores: any[];
  onUploadClick: () => void;
};

export const RecoverFilesTable = (props: RecoverFilesTableProps) => {
  const { decryptedKeyStores, style, accounts, onUploadClick } = props;

  const haveKeystoreForAccount = (account: any) => {
    for (let i = 0; i < decryptedKeyStores.length; i += 1) {
      if (account.publicKey.substr(2) === decryptedKeyStores[i].publicKey) {
        return true;
      }
    }
    return false;
  };

  const sortedAccounts = [...accounts];

  sortedAccounts.sort((acc1, acc2) => {
    const acc1HaveKeystore = haveKeystoreForAccount(acc1);
    const acc2HaveKeystore = haveKeystoreForAccount(acc2);
    if (acc1HaveKeystore && !acc2HaveKeystore) {
      return 1;
    }
    if (acc2HaveKeystore && !acc1HaveKeystore) {
      return -1;
    }
    return 0;
  });

  if (!decryptedKeyStores?.length || !sortedAccounts?.length) {
    onUploadClick && onUploadClick();
    return <></>;
  }

  const padValidatorNumber = (index: number) => {
    return String(index).padStart(index < 10 ? 2 : 3, '0');
  };

  const renderAccountStatus = (account: any) => {
    if (haveKeystoreForAccount(account)) {
      return <FileDecodeSuccess />;
    }
    return (
      <a href="/" onClick={(event) => {
        event.stopPropagation();
        event.preventDefault();
        return onUploadClick && onUploadClick();
      }}>
        <FileDecodeFailure />
        <span style={{ marginLeft: 10 }}>Upload</span>
      </a>
    );
  };

  return (
    <div style={style ?? {}}>
      <SelectedFilesTableContainer>
        <tbody style={{ width: '100%', display: 'inline-table' }}>
          <FileTail key="selected-files-header" className="validators-list">
            <td key="file-progress">
              #
            </td>
            <td key="file-name">
              Validator
            </td>
            <td key="file-delete">
              Keystore
            </td>
          </FileTail>
        </tbody>
      </SelectedFilesTableContainer>
      <SelectedFilesTableContainer>
        <tbody style={{ width: '100%', display: 'inline-table' }}>
          {sortedAccounts?.length ? sortedAccounts.map((account: any, accountIndex: number) => {
          return (
            <FileTail key={accountIndex} className="validators-list">
              <td key="file-progress" style={{ whiteSpace: 'nowrap' }}>
                {padValidatorNumber(accountIndex + 1)}
              </td>
              <td key="file-name">
                <Typography noWrap style={{ width: '100%' }}>
                  {longStringShorten(account.publicKey, 18)}
                </Typography>
              </td>
              <td key="file-delete">
                {renderAccountStatus(account)}
              </td>
            </FileTail>
          );
        }) : ''}
        </tbody>
      </SelectedFilesTableContainer>
    </div>
  );
};
