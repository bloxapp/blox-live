import React, { useEffect, useState } from 'react';
import { shell } from 'electron';
import {connect} from 'react-redux';
import styled from 'styled-components';
import { bindActionCreators } from 'redux';
import config from '~app/backend/common/config';
import { PasswordInput } from '~app/common/components';
import DropZone from '~app/common/components/DropZone';
import { getAccounts } from '~app/components/Accounts/selectors';
import * as actionsFromWizard from '~app/components/Wizard/actions';
import BackButton from '~app/components/Wizard/components/common/BackButton';
import { NETWORKS } from '~app/components/Wizard/components/Validators/constants';
import { Title, Paragraph, Warning } from '~app/components/Wizard/components/common';
import { DECODE_STATUS, FileDecodeProgress } from '~app/common/components/DropZone/components/FileDecode';
import { SelectedFilesTable, RemoveFileDataType } from '~app/common/components/DropZone/components/SelectedFilesTable';
import {
  getNetwork, getDecryptedKeyStoresError, getKeyStores, getDecryptedKeyStores,
  getShouldDisplayError, getDecryptedFilesCount, getIsDecryptingKeyStores
} from '~app/components/Wizard/selectors';

const Wrapper = styled.div`
  width: 650px;
`;

const UploadedFilesHeader = styled.div`
  font-size: 20px;
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
  margin-top: 20px;
  flex-direction: row;
  align-content: flex-start
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
    decryptedKeyStores,
    accounts
  } = props;
  const {decryptKeyStores, uploadKeyStores, displayKeyStoreError, incrementFilesDecryptedCounter} = wizardActions;
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [allFilesJson, setAllFilesJson] = useState(true);
  const [goToNextPage, setGoToNextPage] = useState(false);

  useEffect(() => {
    if (decryptedKeyStores.length > 0 && goToNextPage) {
      setPage(config.WIZARD_PAGES.VALIDATOR.VALIDATOR_SUMMARY);
    }
    const newKeyStores = [...keyStores];
    let isAllFilesJson = true;
    let corruptFileName;
    newKeyStores.map((keyStore: any) => {
      const isJson = keyStore.type === 'application/json';
      // eslint-disable-next-line no-param-reassign
      keyStore.status = isJson ? 1 : 2;
      if (!isJson) {
        if (!corruptFileName) corruptFileName = keyStore.name;
        isAllFilesJson = false;
      }
      return keyStore;
    });

    if (newKeyStores.length === 0) {
      setPassword('');
      displayKeyStoreError({status: false, message: ''});
    }

    const updateStateTimeOut = setTimeout(() => {
      if (!isAllFilesJson) {
        displayKeyStoreError({
          status: true,
          message: <div>Invalid file format <strong>{corruptFileName}</strong> - only .json files are supported.</div>
        });
      }
      setAllFilesJson(isAllFilesJson);
      uploadKeyStores(newKeyStores);
    }, 1000);

    return () => {
      clearTimeout(updateStateTimeOut);
    };
  }, [JSON.stringify(keyStores), decryptedFilesCount, goToNextPage, decryptedKeyStores]);

  // Password Error
  useEffect(() => {
    setPasswordError((password && password?.length < 8) ? 'Password is too short' : '');
  }, [password]);

  /**
   * Opening launchpad link depending of selected network.
   */
  const openLaunchpadLink = async (event: any) => {
    event.preventDefault();
    event.stopPropagation();

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
    displayKeyStoreError({status: false, message: ''});
    files.map((file: any) => {
      // eslint-disable-next-line no-param-reassign
      file.status = DECODE_STATUS.IN_PROGRESS;
      return file;
    });
    let newFileList = [...keyStores, ...files];

    newFileList = newFileList.filter((v, i, a) => a.findIndex(t => (t.name === v.name)) === i);

    if (newFileList.length > 100) {
      displayKeyStoreError({status: true, message: 'You can’t run more than 100 validators per account.'});
      return;
    }

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
    const hashExistingPublicKeys = {};
    accounts.forEach(({publicKey}) => hashExistingPublicKeys[publicKey] = true );
    const isCreation = true;
    decryptKeyStores({keyStores, password, incrementFilesDecryptedCounter, hashExistingPublicKeys, isCreation});
    setGoToNextPage(true);
  };

  const clearKeyStores = () => {
    uploadKeyStores([]);
  };

  const renderCommonError = () => {
    if (shouldDisplayError) {
      const warningStyle = {maxWidth: '100%', marginTop: '20px'};
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
    if (keyStores.length === 0) return '';
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
        <br />
        <Button disabled={buttonDisabled} onClick={decryptFiles}>
          {isDecryptingKeyStores ? <FileDecodeProgress /> : 'Next'}
        </Button>
        {isDecryptingKeyStores && `${decryptedFilesCount}/${keyStores.length} Files Decrypted`}
      </PasswordWrapper>
    );
  };

  const renderFilesHeadings = () => {
    if (keyStores.length === 0) return '';
    return (
      <>
        <br />
        <UploadedFilesHeaderWrapper>
          <UploadedFilesHeader>Uploaded Files</UploadedFilesHeader>
          {keyStores && keyStores.length > 1 && <ClearKeyStores onClick={clearKeyStores}>Clear All</ClearKeyStores>}
        </UploadedFilesHeaderWrapper>
      </>
    );
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
        Dont have a keystore file? Generate keys using <a href="/" onClick={openLaunchpadLink}>Ethereum Launchpad</a>.
      </Paragraph>
      <br />

      <DropZone
        onFiles={onFilesSelected}
        disabled={isDecryptingKeyStores}
        containerStyle={{maxHeight: '200px'}}
      />

      {renderCommonError()}

      <>
        {renderFilesHeadings()}
        <SelectedFilesTable
          onRemoveFile={removeFile}
          keyStores={keyStores ?? []}
          isDecryptingKeyStores={isDecryptingKeyStores}
        />
        {renderPasswordInput()}
      </>
    </Wrapper>
  );
};

type UploadKeystoreFileProps = {
  network: string;
  page: number;
  step: number;
  accounts: Array<any>;
  errorMessage: string;
  keyStores: Array<any>;
  decryptedFilesCount: number;
  shouldDisplayError: boolean;
  isDecryptingKeyStores: boolean;
  decryptedKeyStores: Array<any>;
  setPage: (page: number) => void;
  setStep: (page: number) => void;
  setPageData: (data: any) => void;
  wizardActions: Record<string, any>;
};

const mapStateToProps = (state: any) => ({
  network: getNetwork(state),
  accounts: getAccounts(state),
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
