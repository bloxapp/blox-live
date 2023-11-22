import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import {Layout, Title} from '~app/components/Migration/styles';
import FooterWithButtons from '../../FooterWithButtons/FooterWithButtons';
import {MigrationTitle} from '~app/components/Migration/Migration/styles';
// @ts-ignore
import migrationProgressLogo from '~app/assets/images/migration_in_proccess.svg';
import MigrationBlock from '~app/components/Migration/MigrationBlock/MigrationBlock';
import SsvMigrationProcess from '~app/backend/proccess-manager/ssv-migration.process';
import {Listener} from '~app/components/ProcessRunner/service';
import {STATUSES} from '~app/components/Migration/interfaces';

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

const enum BTN_LABELS {
  MIGRATE = 'migrate',
  RETRY = 'retry'
}

const SecondStep = ({ nextStep, ownerAddress }: { nextStep: () => void; ownerAddress: string }) => {
  const [step1Status, setStep1Status] = useState<STATUSES>(STATUSES.INITIAL);
  const [step2Status, setStep2Status] = useState<STATUSES>(STATUSES.INITIAL);
  const [buttonLabel, setButtonLabel] = useState<BTN_LABELS>(BTN_LABELS.MIGRATE);
  const [runMigrationProcess, setRunMigrationProcess] = useState(null);

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
      }
    };

    const runMigrationProcessFunc = async () => {
      setStep1Status(STATUSES.IN_PROGRESS);
      setButtonLabel(BTN_LABELS.MIGRATE);
      await ssvMigrationProcess.run();
    };

    setRunMigrationProcess(() => runMigrationProcessFunc);
    runMigrationProcessFunc();

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
            text={'The Migration file used to register your validator to its operators. This file is encrypted and can only be used by the operators it was defined for'}
            title={'Creating Migration File'}
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
        acceptAction={buttonLabel === BTN_LABELS.MIGRATE ? nextStep : runMigrationProcess}
        acceptButtonLabel={buttonLabel}
        disabled={step1Status === STATUSES.IN_PROGRESS || step2Status === STATUSES.IN_PROGRESS}
      />
    </div>
  );
};

export default SecondStep;
