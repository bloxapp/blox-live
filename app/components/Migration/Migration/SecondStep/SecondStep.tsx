import React from 'react';
import styled from 'styled-components';
import {Layout, Title} from '~app/components/Migration/styles';
import Buttons from '~app/components/Migration/Buttons/Buttons';
import {MigrationTitle} from '~app/components/Migration/Migration/styles';
// @ts-ignore
import migrationProgressLogo from '~app/assets/images/migration_in_proccess.svg';
import MigrationBlock from '~app/components/Migration/MigrationBlock/MigrationBlock';

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

const SecondStep = ({nextStep, cancelHandler}: {nextStep: () => void, cancelHandler: () => void}) => (
  <div>
    <Title>Migration in progress...</Title>
    <Layout>
      <MigrationTitle>
        Do not terminate the app!
      </MigrationTitle>
      <MigrationBlocksContainer>
        <MigrationBlock text={'The Migration file used to register your validator to its operators.This file is encrypted and can only be used by the operators it was defined for'} title={'Creating Migration File'} />
        <MigrationBlock text={'This ensures your validators will not be running while registering them to the SSV Network'} title={'Deleting key vault'} />
        <ProgressLogo />
      </MigrationBlocksContainer>
    </Layout>
    <Buttons acceptAction={nextStep} cancelAction={cancelHandler} acceptButtonLabel={'Migrate'} />
  </div>
  );

export default SecondStep;
