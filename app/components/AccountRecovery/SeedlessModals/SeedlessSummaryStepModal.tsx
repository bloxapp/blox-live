import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { bindActionCreators } from 'redux';
import { ModalTemplate } from '~app/common/components';
import { getAccounts } from '~app/components/Accounts/selectors';
import * as actionsFromWizard from '~app/components/Wizard/actions';
import { getDecryptedKeyStores } from '~app/components/Wizard/selectors';
import { Title, Warning } from '~app/components/Wizard/components/common';
import { StepIndicator } from '~app/components/AccountRecovery/components';
import { Description } from '~app/common/components/ModalTemplate/components';
import { RecoverFilesTable } from '~app/common/components/DropZone/components/SelectedFilesTable';
// @ts-ignore
import recoveryImage from 'assets/images/img-recovery.svg';

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

const SeedlessSummaryStepModal = (props: SeedlessSummaryStepModalProps) => {
  const {
    onClose,
    onClick,
    goBack,
    accounts,
    wizardActions,
    decryptedKeyStores
  } = props;
  const { uploadKeyStores, clearDecryptProgress } = wizardActions;
  const warningStyle = { maxWidth: '100%', marginTop: 20, width: '100%' };
  const commonWarningStyle = { ...warningStyle, marginTop: 20, marginBottom: 20 };
  const [allKeystoresUploaded, setAllKeystoresUploaded] = useState(true);

  /**
   * Returns true if all accounts matched and no extra-keystores uploaded.
   * Returns false in cases:
   *  - not all accounts matched
   *  - there is more keystores uploaded than accounts exists
   */
  const checkAllKeystoresExistsForAllAccounts = (): boolean => {
    let matchedAccounts = 0;
    for (let accountIndex = 0; accountIndex < accounts.length; accountIndex += 1) {
      for (let keystoreIndex = 0; keystoreIndex < decryptedKeyStores.length; keystoreIndex += 1) {
        const account = accounts[accountIndex];
        if (account.publicKey.substr(2) === decryptedKeyStores[keystoreIndex].publicKey) {
          matchedAccounts += 1;
        }
      }
    }
    return matchedAccounts === accounts.length;
  };

  useEffect(() => {
    setAllKeystoresUploaded(checkAllKeystoresExistsForAllAccounts());
  });

  const onCloseClick = () => {
    onClose && onClose();
  };

  const onUploadClick = () => {
    uploadKeyStores([]);
    clearDecryptProgress();
    goBack && goBack();
  };

  const onGoNext = () => {
    if (allKeystoresUploaded) {
      onClick && onClick();
    }
  };

  const renderNextButton = () => {
    return (
      <Button disabled={!allKeystoresUploaded} onClick={onGoNext} style={{ marginTop: 30 }}>
        Next
      </Button>
    );
  };

  const renderWarning = () => {
    if (allKeystoresUploaded) {
      return '';
    }
    return (
      <Warning
        style={commonWarningStyle}
        text={<>You must upload keystore file for all of your validators.<br />If you cannot retrieve any of your files, please contact our support.</>}
      />
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
      <StepIndicator>Step 02</StepIndicator>

      <Description>
        List of validators to be recovered:
      </Description>

      <RecoverFilesTable
        accounts={accounts}
        onUploadClick={onUploadClick}
        style={{ marginTop: -10, width: '100%' }}
        decryptedKeyStores={decryptedKeyStores ?? []}
      />

      {renderWarning()}
      {renderNextButton()}

    </ModalTemplate>
  );
};

type SeedlessSummaryStepModalProps = {
  onClick: () => void;
  onClose?: () => void;
  goBack: () => void;
  accounts: Array<any>,
  decryptedKeyStores: Array<any>;
  wizardActions: Record<string, any>;
};

const mapStateToProps = (state: any) => ({
  accounts: getAccounts(state),
  decryptedKeyStores: getDecryptedKeyStores(state),
});

const mapDispatchToProps = (dispatch) => ({
  wizardActions: bindActionCreators(actionsFromWizard, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(SeedlessSummaryStepModal);
