/* eslint-disable jsx-a11y/anchor-is-valid jsx-a11y/click-events-have-key-events */
import React, { useEffect, useState } from 'react';
import { shell } from 'electron';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { CircularProgress } from '@material-ui/core';
import config from '~app/backend/common/config';
import DropZone from '~app/common/components/DropZone';
import { getNetwork } from '~app/components/Wizard/selectors';
import { Title, Paragraph } from '~app/components/Wizard/components/common';
import BackButton from '~app/components/Wizard/components/common/BackButton';
import { NETWORKS } from '~app/components/Wizard/components/Validators/constants';
// @ts-ignore
import fileDecodedCheckmark from '../../../../../assets/images/file-decoded-checkmark.svg';
// @ts-ignore
import fileDecodeFailure from '../../../../../assets/images/file-decode-failure.svg';
// @ts-ignore
import removeFileImage from '../../../../../assets/images/remove-file.svg';

const Wrapper = styled.div`
  width:650px;
`;

const UploadedFilesHeader = styled.div`
  font-size: 20px;
  font-style: normal;
  font-weight: 500;
`;

const SelectedFilesTable = styled.table`
  width: 100%;
  margin-top: 15px;
`;

const FileTail = styled.tr`
  border-color: rgba(195, 200, 207, 1);
  border-width: 1px;
  border-style: solid;
  height: 40px;
  background-color: white;
  & > td {
    padding-left: 15px;
    padding-right: 15px;
    &:last-child {
      text-align: right;
    }
  }
  &:not(:first-child) {
    border-top-width: 0;
  }
`;

const RemoveFileImage = styled.img`
  width: 15px;
  height: 15px;
  cursor: pointer;
`;

const FileDecodeProgress = () => (
  <CircularProgress style={{ color: 'black', width: 15, height: 15, marginTop: 6 }} />
);

const FileDecodeFailure = () => {
  const FileDecodeFailureImage = styled.img`
    width: 15px;
    height: 15px;
  `;
  return (
    <FileDecodeFailureImage src={fileDecodeFailure} />
  );
};

const FileDecodeSuccess = () => {
  const FileDecodedImage = styled.img`
    width: 20px;
    height: 15px;
  `;
  return (
    <FileDecodedImage src={fileDecodedCheckmark} />
  );
};

enum DECODE_STATUS {
  IN_PROGRESS,
  SUCCESS,
  FAILURE
}

const FileDecodeStatus = ({ status }: { status: DECODE_STATUS }) => {
  switch (status) {
    case DECODE_STATUS.IN_PROGRESS:
      return <FileDecodeProgress />;
    case DECODE_STATUS.SUCCESS:
      return <FileDecodeSuccess />;
    case DECODE_STATUS.FAILURE:
      return <FileDecodeFailure />;
  }
  return <></>;
};

const UploadKeystoreFile = (props: UploadKeystoreFileProps) => {
  const { setPage, setStep, network } = props;
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [decryptedFilesList, setDecryptedFilesList] = useState({});

  /**
   * Opening launchpad link depending of selected network.
   */
  const openLaunchpadLink = async () => {
    console.debug(network);
    let url = '';
    if (network === String(NETWORKS.mainnet.name).toLowerCase()) {
      url = config.env.LAUNCHPAD_URL.MAINNET;
    } else {
      url = config.env.LAUNCHPAD_URL.TESTNET;
    }
    await shell.openExternal(url);
  };

  const onFilesSelected = (files: File[]) => {
    files.sort((a, b) => a.name.localeCompare(b.name));
    setSelectedFiles(files);
  };

  type DecryptedFile = {
    file: File,
    decrypted: any,
    status: number,
  };

  /**
   * Decrypt one file
   * @param file
   */
  const decryptFile = async (file: File): Promise<DecryptedFile> => {
    if (decryptedFilesList[file.name]) {
      return decryptedFilesList[file.name];
    }
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          file,
          decrypted: 'anything',
          status: Math.round(Math.random() * 1) + 1,
        });
      }, Math.random() * 5000);
    });
  };

  /**
   * Decrypt all files
   * @param files
   */
  const decryptFiles = (files: File[]) => {
    return files.map((file: File) => {
      return decryptFile(file).then((decrypted: DecryptedFile) => {
        decryptedFilesList[file.name] = decrypted;
        setDecryptedFilesList({...decryptedFilesList});
      });
    });
  };

  /**
   * Remove file by clicking X button in it's tale.
   * @param fileName
   * @param fileIndex
   */
  const removeFile = (fileName: string, fileIndex: number) => {
    delete decryptedFilesList[fileName];
    setDecryptedFilesList({...decryptedFilesList});
    selectedFiles.splice(fileIndex, 1)
    setSelectedFiles([...selectedFiles]);
  };

  useEffect(() => {
    if (selectedFiles?.length) {
      setDecryptedFilesList({});
      decryptFiles(selectedFiles);
    }
  }, [selectedFiles]);

  const renderSelectedFiles = () => {
    return (
      <SelectedFilesTable>
        <tbody>
          {selectedFiles.map((file: File, fileIndex: number) => {
            // @ts-ignore
            return (
              <FileTail key={`file-tail-${fileIndex}`}>
                <td key="file-progress">
                  <FileDecodeStatus status={decryptedFilesList[file.name]?.status ?? DECODE_STATUS.IN_PROGRESS} />
                </td>
                <td key="file-name">
                  {file.name}
                </td>
                <td key="file-delete">
                  <RemoveFileImage
                    src={removeFileImage}
                    onClick={() => {
                      removeFile(file.name, fileIndex);
                    }}
                  />
                </td>
              </FileTail>
            );
          })}
        </tbody>
      </SelectedFilesTable>
    );
  };

  return (
    <Wrapper>
      <BackButton onClick={() => {
        setStep(config.WIZARD_STEPS.VALIDATOR_SETUP);
        setPage(config.WIZARD_PAGES.VALIDATOR.SELECT_NETWORK);
      }} />
      <Title>Upload Keystore File</Title>
      <Paragraph style={{ marginBottom: 10 }}>
        Got more than one validator? Upload multiple keystore files at once.
        <br />
        <br />
        Dont have a keystore file? Generate keys using <a onClick={openLaunchpadLink}>Ethereum Launchpad</a>.
      </Paragraph>
      <br />

      <DropZone
        accept=".json,application/json"
        onFiles={onFilesSelected}
      />

      {selectedFiles?.length ? (
        <>
          <br />
          <UploadedFilesHeader>Uploaded Files</UploadedFilesHeader>
          {renderSelectedFiles()}
        </>
      ) : ''}
    </Wrapper>
  );
};

type UploadKeystoreFileProps = {
  network: string;
  page: number;
  setPage: (page: number) => void;
  step: number;
  setStep: (page: number) => void;
  setPageData: (data: any) => void;
};

const mapStateToProps = (state: any) => ({
  network: getNetwork(state),
});

export default connect(mapStateToProps, null)(UploadKeystoreFile);
