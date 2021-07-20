/* eslint-disable jsx-a11y/anchor-is-valid jsx-a11y/click-events-have-key-events */
import React, { useEffect, useState } from 'react';
import { shell } from 'electron';
import { connect } from 'react-redux';
import styled from 'styled-components';
import {bindActionCreators} from 'redux';
import { CircularProgress } from '@material-ui/core';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import config from '~app/backend/common/config';
import DropZone from '~app/common/components/DropZone';
import { getNetwork, getDecryptedKeyStores } from '~app/components/Wizard/selectors';
import { Title, Paragraph } from '~app/components/Wizard/components/common';
import BackButton from '~app/components/Wizard/components/common/BackButton';
import { NETWORKS } from '~app/components/Wizard/components/Validators/constants';
// @ts-ignore
import * as actionsFromWizard from '../../../actions';
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

const Button = styled.button`
  display: block;
  width: 200px;
  height: 35px;
  color: white;
  border-radius: 10px;
  border: none;
  background-color: #2536b8;
  margin-top: 20px;
  cursor: pointer;
  &:hover {
    background-color: #2546b2;
  }
  &:disabled {
    background-color: lightgrey;
  }
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

const PasswordWrapper = styled.div`
  margin-top: 20px;
  flex-direction: row;
  align-content: flex-start
`;

const PasswordText = styled.span`
  display: block;
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
  const { setPage, setStep, network, wizardActions, decryptedKeyStores } = props;
  const { decryptKeyStores } = wizardActions;
  const [selectedFiles, setSelectedFiles] = useState(decryptedKeyStores ?? []);
  const [decryptedFilesList, setDecryptedFilesList] = useState({});
  const [readyForNextScreen, setReadyForNextScreen] = useState(false);
  const [values, setValues] = useState({
    password: '',
    showPassword: false,
  });

  useEffect(() => {
    console.log('<<<<<<<<<<<<useEffect>>>>>>>>>>>>');
    let isFilesJson: boolean = true;
    selectedFiles.forEach((file: any) => {
       if (file.type !== 'application/json') isFilesJson = false;
    });
      setReadyForNextScreen(values.password && selectedFiles.length > 0 && selectedFiles.length < 100 && isFilesJson);
  }, [values.password, selectedFiles.length]);

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
    let newFileList = [...files, ...selectedFiles];
    newFileList = newFileList.filter((v, i, a) => a.findIndex(t => (t.name === v.name)) === i);
    newFileList = newFileList.sort((a, b) => a.name.localeCompare(b.name));
    setSelectedFiles(newFileList);
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
    const isJson = file.type === 'application/json';

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          file,
          decrypted: 'anything',
          status: isJson ? 1 : 2,
        });
      }, Math.random() * 1000);
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
    selectedFiles.splice(fileIndex, 1);
    setSelectedFiles([...selectedFiles]);
  };

  const handleClickShowPassword = () => {
    setValues({ ...values, showPassword: !values.showPassword });
  };

  const handleChange = (prop: any) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [prop]: event.target.value });
  };

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const decrypt = async () => {
    await decryptKeyStores(selectedFiles);
    console.log('<<<<<<<<<<<<<here>>>>>>>>>>>>>');
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
        onFiles={onFilesSelected}
      />

      {selectedFiles?.length ? (
        <>
          <br />
          <UploadedFilesHeader>Uploaded Files</UploadedFilesHeader>
          {renderSelectedFiles()}
        </>
      ) : ''}
      <PasswordWrapper>
        <PasswordText>Keystore Password</PasswordText>
        <OutlinedInput
          style={{ height: '40px' }}
          id="outlined-adornment-password"
          type={values.showPassword ? 'text' : 'password'}
          value={values.password}
          onChange={handleChange('password')}
          endAdornment={(
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={handleClickShowPassword}
                onMouseDown={handleMouseDownPassword}
                edge="end"
              >
                {values.showPassword ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            </InputAdornment>
          )}
          labelWidth={70}
        />
        <Button disabled={!readyForNextScreen} onClick={decrypt}>
          Next
        </Button>
      </PasswordWrapper>
    </Wrapper>
  );
};

type UploadKeystoreFileProps = {
  network: string;
  decryptedKeyStores: [];
  page: number;
  setPage: (page: number) => void;
  step: number;
  setStep: (page: number) => void;
  setPageData: (data: any) => void;
  wizardActions: Record<string, any>;
};

const mapStateToProps = (state: any) => ({
  network: getNetwork(state),
  decryptedKeyStores: getDecryptedKeyStores(state),
});

const mapDispatchToProps = (dispatch) => ({
  wizardActions: bindActionCreators(actionsFromWizard, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(UploadKeystoreFile);
