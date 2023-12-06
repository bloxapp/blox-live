import React, {useEffect, useState} from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import {Layout, Title} from '../styles';
import FooterWithButtons from '../FooterWithButtons/FooterWithButtons';
// @ts-ignore
import migrationProgressLogo from '../../../assets/images/migration_in_proccess.svg';
import MigrationBlock from '../MigrationBlock/MigrationBlock';
import SsvMigrationProcess from '../../../backend/proccess-manager/ssv-migration.process';
import {Listener} from '../../ProcessRunner/service';
import {STATUSES} from '../interfaces';
import {getOwnerAddress} from '../selectors';
import UsersService, { SSVMigrationStatus } from '../../../backend/services/users/users.service';
import usePasswordHandler from '../../PasswordHandler/usePasswordHandler';
import Connection from '../../../backend/common/store-manager/connection';

const MigrationBlocksContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const ProgressLogo = styled.div`
  width: 160.999px;
  height: 132.478px;
  margin: 0 45px 0 45px;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  background-image: url(${migrationProgressLogo});
`;

export const MigrationTitle = styled.h1`
  margin: 0;
  color:  #067BC4;
  font-family: Avenir, sans-serif;
  font-size: 18px;
  font-style: normal;
  font-weight: 800;
  line-height: 24px;
`;

const enum BTN_LABELS {
  MIGRATE = 'Migrate',
  RETRY = 'Retry'
}

const Phase1Step2 = ({ nextStep }: { nextStep: () => void }) => {
  const [step1Status, setStep1Status] = useState<STATUSES>(STATUSES.INITIAL);
  const [step2Status, setStep2Status] = useState<STATUSES>(STATUSES.INITIAL);
  const [buttonLabel, setButtonLabel] = useState<BTN_LABELS>(BTN_LABELS.MIGRATE);
  const [runMigrationProcess, setRunMigrationProcess] = useState(null);

  const { checkIfPasswordIsNeeded } = usePasswordHandler();

  const ownerAddress = useSelector(getOwnerAddress);

  const showPasswordProtectedDialog = (callback) => async () => {
    const cryptoKey = 'temp';
    const isTemporaryCryptoKeyValid = await Connection.db().isCryptoKeyValid(cryptoKey);
    if (isTemporaryCryptoKeyValid) {
      // If temp crypto key is valid - we should set it anyway
      await Connection.db().setCryptoKey(cryptoKey);
    }
    console.log('isTemporaryCryptoKeyValid ', isTemporaryCryptoKeyValid);
    return isTemporaryCryptoKeyValid
      ? await callback()
      : checkIfPasswordIsNeeded(callback);
  };

  useEffect(() => {
    const ssvMigrationProcess = new SsvMigrationProcess({ ownerAddress });

    const callback = (_subject, payload) => {
      const { error, state, step } = payload;

      if (error) {
        console.log('+++ error', error);
        setStep1Status(STATUSES.INITIAL);
        setStep2Status(STATUSES.INITIAL);
        setButtonLabel(BTN_LABELS.RETRY);
      } else if (state === 'completed') {
        console.log('+++ completed', step);
      } else if (step.num === 1) {
        setStep1Status(STATUSES.COMPLETE);
        setStep2Status(STATUSES.IN_PROGRESS);
      } else if (step.num === 3) {
        setStep2Status(STATUSES.COMPLETE);
        const usersService = UsersService.getInstance();
        usersService.update({ migrationStatus: SSVMigrationStatus.CREATED_KEYSHARES });
      }
    };

    const runMigrationProcessFunc = async () => {
      setStep1Status(STATUSES.IN_PROGRESS);
      setButtonLabel(BTN_LABELS.MIGRATE);
      await ssvMigrationProcess.run();
    };

    setRunMigrationProcess(() => showPasswordProtectedDialog(runMigrationProcessFunc));
    showPasswordProtectedDialog(runMigrationProcessFunc)();

    const listener = new Listener(callback);
    ssvMigrationProcess.subscribe(listener);

    return () => {
      ssvMigrationProcess.unsubscribe(listener);
    };
  }, []);

  return (
    <div>
      <Title>Migration in progress...</Title>
      <Layout>
        <MigrationTitle>
          Do not terminate the app!
        </MigrationTitle>
        <MigrationBlocksContainer>
          <MigrationBlock
            text={'The MigrationPhase1 file used to register your validator to its operators. This file is encrypted and can only be used by the operators it was defined for'}
            title={'Creating MigrationPhase1 File'}
            status={step1Status}
          />
          <MigrationBlock
            text={'This ensures your validators will not be running while registering them to the SSV Network'}
            title={'Deleting key vault'}
            status={step2Status}
          />
          <ProgressLogo />
        </MigrationBlocksContainer>
      </Layout>
      <FooterWithButtons
        acceptAction={step2Status === STATUSES.COMPLETE ? nextStep : runMigrationProcess}
        acceptButtonLabel={buttonLabel}
        disabled={step1Status === STATUSES.IN_PROGRESS || step2Status === STATUSES.IN_PROGRESS}
      />
    </div>
  );
};

export default Phase1Step2;
