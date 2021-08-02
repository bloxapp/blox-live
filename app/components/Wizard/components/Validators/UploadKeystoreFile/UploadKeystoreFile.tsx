import React, {useEffect, useState} from 'react';
import {shell} from 'electron';
import {connect} from 'react-redux';
import styled from 'styled-components';
import {bindActionCreators} from 'redux';
import {CircularProgress} from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import Visibility from '@material-ui/icons/Visibility';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import InputAdornment from '@material-ui/core/InputAdornment';
import config from '~app/backend/common/config';
import DropZone from '~app/common/components/DropZone';
import {Title, Paragraph, Warning} from '~app/components/Wizard/components/common';
import BackButton from '~app/components/Wizard/components/common/BackButton';
import {NETWORKS} from '~app/components/Wizard/components/Validators/constants';
import {
  getNetwork,
  getDecryptedKeyStoresError,
  getKeyStores,
  getDecryptedKeyStores,
  getShouldDisplayError,
  getDecryptedFilesCount,
  getIsDecryptingKeyStores
} from '~app/components/Wizard/selectors';
// @ts-ignore
import * as actionsFromWizard from '../../../actions';
import removeFileImage from '../../../../../assets/images/remove-file.svg';
// @ts-ignore
import fileDecodeFailure from '../../../../../assets/images/file-decode-failure.svg';
// @ts-ignore
import fileDecodedCheckmark from '../../../../../assets/images/file-decoded-checkmark.svg';

const Wrapper = styled.div`
  width: 650px;
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

const FileDecodeFailureImage = styled.img`
  width: 15px;
  height: 15px;
`;

const FileDecodedImage = styled.img`
  width: 20px;
  height: 15px;
`;

const ClearKeyStores = styled.div`
  color: black;
  cursor: pointer;
`;

const UploadedFilesHeaderWrapper = styled.div`
  width: 100%;
  justify-content: space-between;
  display: flex;
`;

const FileDecodeProgress = () => (
  <CircularProgress style={{color: 'black', width: 15, height: 15, marginTop: 6}} />
);

const FileDecodeFailure = () => {
  return (
    <FileDecodeFailureImage src={fileDecodeFailure} />
  );
};

const FileDecodeSuccess = () => {
  return (
    <FileDecodedImage src={fileDecodedCheckmark} />
  );
};

enum DECODE_STATUS {
  IN_PROGRESS,
  SUCCESS,
  FAILURE
}

const FileDecodeStatus = ({status}: { status: DECODE_STATUS }) => {
  switch (status) {
    case DECODE_STATUS.IN_PROGRESS:
      return <FileDecodeProgress />;
    case DECODE_STATUS.SUCCESS:
      return <FileDecodeSuccess />;
    case DECODE_STATUS.FAILURE:
      return <FileDecodeFailure />;
  }
};

const UploadKeystoreFile = (props: UploadKeystoreFileProps) => {
  const {
    setPage,
    setStep,
    network,
    wizardActions,
    keyStores,
    shouldDisplayError,
    errorMessage,
    decryptedFilesCount,
    isDecryptingKeyStores,
    decryptedKeyStores
  } = props;
  const {decryptKeyStores, uploadKeyStores, displayKeyStoreError, incrementFilesDecryptedCounter} = wizardActions;
  const [allFilesJson, setAllFilesJson] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [goToNextPage, setGoToNextPage] = useState(false);
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (decryptedKeyStores.length > 0 && goToNextPage) {
      setPage(config.WIZARD_PAGES.VALIDATOR.VALIDATOR_SUMMARY);
    }
    const newKeyStores = [...keyStores];
    let isAllFilesJson = true;
    newKeyStores.map((keyStore) => {
      const isJson = keyStore.type === 'application/json';
      keyStore.status = isJson ? 1 : 2;
      if (!isJson) isAllFilesJson = false;
    });

    const updateStateTimeOut = setTimeout(() => {
      setAllFilesJson(isAllFilesJson);
      uploadKeyStores(newKeyStores);
    }, 1000);

    return () => {
      clearTimeout(updateStateTimeOut);
    };
  }, [keyStores.length, decryptedFilesCount, goToNextPage, decryptedKeyStores]);

  useEffect(() => {
    const removeErrorMessage = setTimeout(() => {
      displayKeyStoreError({status: false, message: ''});
    }, 3000);
    return () => {
      clearTimeout(removeErrorMessage);
    };
  }, [shouldDisplayError]);

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
    if (isDecryptingKeyStores) {
      return;
    }
    let newFileList = [...files, ...keyStores];
    if (newFileList.length > 100) {
      displayKeyStoreError({status: true, message: 'You can’t run more than 100 validators per account.'});
      return;
    }
    displayKeyStoreError({status: false, message: ''});
    newFileList = newFileList.filter((v, i, a) => a.findIndex(t => (t.name === v.name)) === i);
    newFileList.map(file => file.status = 0);
    uploadKeyStores(newFileList);
  };

  /**
   * Remove file by clicking X button in it's tale.
   * @param fileName
   * @param fileIndex
   */
  const removeFile = (fileIndex: number) => {
    const newKeysStores = [...keyStores];
    newKeysStores.splice(fileIndex, 1);
    uploadKeyStores([...newKeysStores]);
  };

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const decryptFiles = async () => {
    decryptKeyStores({keyStores, password, incrementFilesDecryptedCounter});
    setGoToNextPage(true);
  };

  const clearKeyStores = () => {
    uploadKeyStores([]);
  };

  return (
    <Wrapper>
      <BackButton onClick={() => {
        setStep(config.WIZARD_STEPS.VALIDATOR_SETUP);
        setPage(config.WIZARD_PAGES.VALIDATOR.SELECT_NETWORK);
      }} />
      <Title>Upload Keystore File</Title>
      <Paragraph style={{marginBottom: 10}}>
        Got more than one validator? Upload multiple keystore files at once.
        <br />
        <br />
        Dont have a keystore file? Generate keys using <a onClick={openLaunchpadLink}>Ethereum Launchpad</a>.
      </Paragraph>
      <br />

      <DropZone
        onFiles={onFilesSelected}
      />

      {shouldDisplayError && <Warning style={{maxWidth: '100%', marginTop: '20px'}} text={errorMessage}/>}

      <>
        <br />
        <UploadedFilesHeaderWrapper>
          <UploadedFilesHeader>Uploaded Files</UploadedFilesHeader>
          {keyStores && keyStores.length > 1 && <ClearKeyStores onClick={clearKeyStores}>Clear All</ClearKeyStores>}
        </UploadedFilesHeaderWrapper>
        <SelectedFilesTable>
          <tbody>
          {keyStores && keyStores.map((file: File, fileIndex: number) => {
            // @ts-ignore
            return (
              <FileTail key={fileIndex}>
                <td key="file-progress">
                  <FileDecodeStatus status={file?.status} />
                </td>
                <td key="file-name">
                  {file.name}
                </td>
                <td key="file-delete">
                  <RemoveFileImage
                    src={removeFileImage}
                    onClick={() => {
                      if (!isDecryptingKeyStores) removeFile(fileIndex);
                    }}
                  />
                </td>
              </FileTail>
            );
          })}
          </tbody>
        </SelectedFilesTable>
        <PasswordWrapper>
          <PasswordText>Keystore Password</PasswordText>
          <OutlinedInput
            style={{height: '40px'}}
            id="outlined-adornment-password"
            type={showPassword ? 'text' : 'password'}
            onBlur={(e) => {
              setPassword(e.target.value);
            }}
            endAdornment={(
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() => {
                    setShowPassword(!showPassword);
                  }}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                >
                  {showPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            )}
            labelWidth={70}
          />
          <Button disabled={!(allFilesJson && password && keyStores.length > 0 && !isDecryptingKeyStores)} onClick={decryptFiles}>
            {isDecryptingKeyStores ? <FileDecodeProgress /> : 'Next'}
          </Button>
          {isDecryptingKeyStores && `${decryptedFilesCount}/${keyStores.length} Files Decrypted`}
        </PasswordWrapper>
      </>
    </Wrapper>
  );
};

type UploadKeystoreFileProps = {
  network: string;
  keyStores: Array<any>,
  page: number;
  setPage: (page: number) => void;
  step: number;
  setStep: (page: number) => void;
  setPageData: (data: any) => void;
  wizardActions: Record<string, any>;
  errorMessage: string,
  shouldDisplayError: boolean,
  decryptedFilesCount: number,
  isDecryptingKeyStores: boolean,
  decryptedKeyStores: Array<any>;
};

const mapStateToProps = (state: any) => ({
  network: getNetwork(state),
  keyStores: getKeyStores(state),
  errorMessage: getDecryptedKeyStoresError(state),
  shouldDisplayError: getShouldDisplayError(state),
  decryptedFilesCount: getDecryptedFilesCount(state),
  decryptedKeyStores: getDecryptedKeyStores(state),
  isDecryptingKeyStores: getIsDecryptingKeyStores(state),
});

const mapDispatchToProps = (dispatch) => ({
  wizardActions: bindActionCreators(actionsFromWizard, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(UploadKeystoreFile);
