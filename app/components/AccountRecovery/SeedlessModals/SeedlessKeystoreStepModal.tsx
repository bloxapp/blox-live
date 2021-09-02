import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { bindActionCreators } from 'redux';
import DropZone from '~app/common/components/DropZone';
import * as actionsFromWizard from '~app/components/Wizard/actions';
import { ModalTemplate, PasswordInput } from '~app/common/components';
import { Title, Warning } from '~app/components/Wizard/components/common';
import { StepIndicator } from '~app/components/AccountRecovery/components';
import { Description } from '~app/common/components/ModalTemplate/components';
import { DECODE_STATUS, FileDecodeProgress } from '~app/common/components/DropZone/components/FileDecode';
import { SelectedFilesTable, RemoveFileDataType } from '~app/common/components/DropZone/components/SelectedFilesTable';
import {
  getDecryptedKeyStoresError, getKeyStores, getDecryptedKeyStores,
  getShouldDisplayError, getDecryptedFilesCount, getIsDecryptingKeyStores
} from '~app/components/Wizard/selectors';

// @ts-ignore
import recoveryImage from 'assets/images/img-recovery.svg';

const UploadedFilesHeader = styled.div`
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
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

const PasswordWrapper = styled.div`
  margin-top: 15px;
  flex-direction: row;
  align-content: flex-start
`;

const ClearKeyStores = styled.div`
  color: black;
  cursor: pointer;
  font-size: 14px;
`;

const UploadedFilesHeaderWrapper = styled.div`
  width: 100%;
  justify-content: space-between;
  display: flex;
  margin-top: 15px;
  margin-bottom: 15px;
`;

const UploadKeystoreFile = (props: UploadKeystoreFileProps) => {
  const {
    onClose,
    onClick,
    wizardActions,
    keyStores,
    shouldDisplayError,
    errorMessage,
    decryptedFilesCount,
    isDecryptingKeyStores,
    decryptedKeyStores
  } = props;
  const { decryptKeyStores, uploadKeyStores, displayKeyStoreError, incrementFilesDecryptedCounter } = wizardActions;
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [allFilesJson, setAllFilesJson] = useState(true);
  const [goToNextPage, setGoToNextPage] = useState(false);
  const warningStyle = { maxWidth: '100%', marginTop: 20, width: '100%' };
  const commonWarningStyle = { ...warningStyle, marginTop: -10, marginBottom: 20 };

  useEffect(() => {
    if (decryptedKeyStores.length > 0 && goToNextPage) {
      return onClick && onClick();
    }
    const newKeyStores = [...keyStores];
    let isAllFilesJson = true;
    newKeyStores.map((keyStore: any) => {
      const isJson = keyStore.type === 'application/json';
      // eslint-disable-next-line no-param-reassign
      keyStore.status = isJson ? 1 : 2;
      if (!isJson) {
        isAllFilesJson = false;
      }
      return keyStore;
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
      displayKeyStoreError({ status: false, message: '' });
    }, 3000);
    return () => {
      clearTimeout(removeErrorMessage);
    };
  }, [shouldDisplayError]);

  useEffect(() => {
    if (!isDecryptingKeyStores && decryptedFilesCount > 0 && decryptedFilesCount === keyStores.length) {
      setGoToNextPage(true);
    }
  }, [isDecryptingKeyStores, decryptedFilesCount]);

  const onFilesSelected = (files: File[]) => {
    if (isDecryptingKeyStores) {
      return;
    }
    let newFileList = [...files, ...keyStores];
    if (newFileList.length > 100) {
      displayKeyStoreError({ status: true, message: 'You can’t run more than 100 validators per account.' });
      return;
    }

    displayKeyStoreError({ status: false, message: '' });
    newFileList = newFileList.filter((v, i, a) => a.findIndex(t => (t.name === v.name)) === i);
    newFileList.map((file: any) => {
      // eslint-disable-next-line no-param-reassign
      file.status = DECODE_STATUS.IN_PROGRESS;
      return file;
    });
    uploadKeyStores(newFileList);
  };

  const removeFile = (fileData: RemoveFileDataType): void => {
    const { file, fileIndex } = fileData;
    console.debug('Removing file:', file);
    const newKeysStores = [...keyStores];
    newKeysStores.splice(fileIndex, 1);
    uploadKeyStores([...newKeysStores]);
  };

  const decryptFiles = async () => {
    decryptKeyStores({ keyStores, password, incrementFilesDecryptedCounter });
  };

  const clearKeyStores = () => {
    if (isDecryptingKeyStores) {
      return;
    }
    uploadKeyStores([]);
  };

  const renderCommonError = () => {
    if (shouldDisplayError) {
      return (
        <Warning
          text={errorMessage}
          style={warningStyle}
        />
      );
    }
    return '';
  };

  const renderPasswordInput = () => {
    if (!keyStores.length) {
      return '';
    }
    const onBlur = (e: any) => {
      setPasswordError((e.target.value && e.target.value?.length < 8) ? 'Password is too short' : '');
      setPassword(e.target.value);
    };
    const buttonDisabled = !(allFilesJson && password && password.length >= 8 && keyStores.length > 0 && !isDecryptingKeyStores);

    return (
      <PasswordWrapper>
        <PasswordInput
          width={'190px'}
          onBlur={onBlur}
          value={password}
          name={'password'}
          onChange={setPassword}
          title={'Keystore Password'}
          error={passwordError || ''}
          isDisabled={isDecryptingKeyStores}
        />
        <Button disabled={buttonDisabled} onClick={decryptFiles} style={{ marginTop: 30 }}>
          {isDecryptingKeyStores ? <FileDecodeProgress /> : 'Next'}
        </Button>
        {isDecryptingKeyStores && `${decryptedFilesCount}/${keyStores.length} Files Decrypted`}
      </PasswordWrapper>
    );
  };

  const onCloseClick = () => {
    onClose && onClose();
  };

  const renderFilesHeadings = () => {
    if (!keyStores.length) {
      return '';
    }
    return (
      <UploadedFilesHeaderWrapper>
        <UploadedFilesHeader>Uploaded Files</UploadedFilesHeader>
        {keyStores && keyStores.length > 1 && <ClearKeyStores onClick={clearKeyStores}>Clear All</ClearKeyStores>}
      </UploadedFilesHeaderWrapper>
    );
  };

  return (
    <ModalTemplate
      width="900px"
      image={recoveryImage}
      justifyContent={'initial'}
      padding={'30px 32px 30px 64px'}
      onClose={onClose ? onCloseClick : null}
    >
      <Title style={{ marginBottom: 0 }}>Recover Account Data</Title>
      <StepIndicator>Step 01</StepIndicator>

      <Description>
        To recover your account, please upload all of your validator&lsquo;s keystore files.
      </Description>

      <Warning
        text="Only keystore files with the same password are supported. If you have other keystore files with a different password you should upload them later in a different batch."
        style={commonWarningStyle}
      />

      <DropZone
        onFiles={onFilesSelected}
        disabled={isDecryptingKeyStores}
        containerStyle={{ width: '100%', maxHeight: 100 }}
      />

      {renderCommonError()}
      {renderFilesHeadings()}

      <SelectedFilesTable
        onRemoveFile={removeFile}
        keyStores={keyStores ?? []}
        style={{maxHeight: '200px'}}
        isDecryptingKeyStores={isDecryptingKeyStores}
      />

      {renderPasswordInput()}

    </ModalTemplate>
  );
};

type UploadKeystoreFileProps = {
  onClick: () => void;
  onClose: () => void | null;
  keyStores: Array<any>,
  wizardActions: Record<string, any>;
  errorMessage: string,
  shouldDisplayError: boolean,
  decryptedFilesCount: number,
  isDecryptingKeyStores: boolean,
  decryptedKeyStores: Array<any>;
};

const mapStateToProps = (state: any) => ({
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
