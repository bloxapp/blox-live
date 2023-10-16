import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import {Layout, Title} from '~app/components/Migration/styles';
import Buttons from '~app/components/Migration/Buttons/Buttons';
import {MigrationTitle} from '~app/components/Migration/Migration/styles';
// @ts-ignore
import migrationProgressLogo from '~app/assets/images/migration_in_proccess.svg';
import MigrationBlock from '~app/components/Migration/MigrationBlock/MigrationBlock';
import SsvMigrationProcess from '~app/backend/proccess-manager/ssv-migration.process';
import { Listener } from '~app/components/ProcessRunner/service';

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

const SecondStep = ({ nextStep, cancelHandler, ownerAddress }) => {
  const [step1Status, setStep1Status] = useState('notStarted');
  const [step2Status, setStep2Status] = useState('notStarted');
  const [buttonLabel, setButtonLabel] = useState('Migrate');
  const [runMigrationProcess, setRunMigrationProcess] = useState(null);

  useEffect(() => {
    const ssvMigrationProcess = new SsvMigrationProcess({ ownerAddress });

    const callback = (subject, payload) => {
      const { error, state, step } = payload;

      if (error) {
        console.log('+++ error', error);
        setStep1Status('notStarted');
        setStep2Status('notStarted');
        setButtonLabel('Retry');
      } else if (state === 'completed') {
        console.log('+++ completed', step);
      } else if (step.num === 1) {
        setStep1Status('completed');
        setStep2Status('inProgress');
      } else if (step.num === 3) {
        setStep2Status('completed');
      }
    };

    const runMigrationProcessFunc = async () => {
      setStep1Status('inProgress');
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
      <Buttons
        acceptAction={buttonLabel === 'Migrate' ? nextStep : runMigrationProcess}
        cancelAction={cancelHandler}
        acceptButtonLabel={buttonLabel}
        disabled={buttonLabel === 'Migrate' && (step1Status !== 'completed' || step2Status !== 'completed')}
        showBackButton={true}
      />
    </div>
  );
};

export default SecondStep;
