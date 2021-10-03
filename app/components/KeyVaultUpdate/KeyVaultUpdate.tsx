import React, { useState } from 'react';
import { connect } from 'react-redux';
import { selectedKeystoreMode } from '~app/common/service';
import { getProcessNameForUpdate } from '~app/utils/process';
import * as wizardSelectors from '~app/components/Wizard/selectors';
import * as SeedlessModals from '~app/components/AccountRecovery/SeedlessModals';
import * as keyVaultSelectors from '~app/components/KeyVaultManagement/selectors';
import { SuccessModal, ReinstallingModal, FailureModal, ThankYouModal } from '~app/components/KeyVaultModals';
// @ts-ignore
import activeImage from '../Wizard/assets/img-key-vault.svg';

const { SeedlessKeystoreStepModal, SeedlessSummaryStepModal } = SeedlessModals;

const KeyVaultUpdate = ({onSuccess, onClose, keyVaultCurrentVersion, keyVaultLatestVersion}: Props) => {
  const isFullReinstall = () => {
    return getProcessNameForUpdate(keyVaultCurrentVersion, keyVaultLatestVersion) === 'reinstall';
  };

  const [step, setStep] = useState(isFullReinstall() && selectedKeystoreMode() ? -1 : 1);
  const move1StepForward = () => setStep(step + 1);
  const move2StepsForward = () => setStep(step + 2);
  const defaultDialog = (
    <ReinstallingModal
      title={'Updating KeyVault'}
      move1StepForward={move1StepForward}
      move2StepsForward={move2StepsForward}
      image={activeImage}
    />
  );

  switch (step) {
    case -1:
      return <SeedlessKeystoreStepModal onClose={onClose} onClick={() => { setStep(-2); }} />;
    case -2:
      return <SeedlessSummaryStepModal onClick={() => { setStep(1); }} goBack={() => { setStep(-1); }} />;
    case 1:
      return defaultDialog;
    case 2:
      return <SuccessModal title={'KeyVault Updated!'} onSuccess={onSuccess} text={'All Validators are now performing normally.'} />;
    case 3:
      return <FailureModal title={'Troubleshooting Failed'} onClick={move1StepForward} onClose={onClose} />;
    case 4:
      return <ThankYouModal onClose={onClose} />;
    default:
      return defaultDialog;
  }
};

type Props = {
  onSuccess: () => void;
  onClose: () => void;
  keyVaultCurrentVersion: string;
  keyVaultLatestVersion: string;
};

const mapStateToProps = (state: State) => ({
  keyVaultCurrentVersion: wizardSelectors.getWalletVersion(state),
  keyVaultLatestVersion: keyVaultSelectors.getLatestVersion(state),
});

type State = Record<string, any>;

export default connect(mapStateToProps, null)(KeyVaultUpdate);
