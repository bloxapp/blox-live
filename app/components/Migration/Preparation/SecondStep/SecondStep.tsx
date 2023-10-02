import React from 'react';
import {Layout} from '~app/components/Migration/styles';
import Buttons from '~app/components/Migration/Buttons/Buttons';
import MigrationBlock from '~app/components/Migration/MigrationBlock/MigrationBlock';
import {PreparationItemsContainer, PreparationTitle} from '~app/components/Migration/Preparation/styles';

const MIGRATION_PREPARATION = [
  {
    stepNumber: 1,
    title: 'Set Owner Address',
    text: 'Set  the Ethereum address that you will register your validators on the SSV Network with.',
  }, {
    stepNumber: 2,
    title: 'Migration Folder prep & Key vault shutdown',
    text: 'Prepare migration folder and turn off the KeyVault. After this, validators will be offline until registration.',
  }, {
    stepNumber: 3,
    title: 'Validator Registration ',
    text: 'Register your validators with the SSV network. Once done, they\'ll start operating right away.',
  },
];
const SecondStep = ({goToNexStep, cancelHandler}: {goToNexStep: () => void, cancelHandler: () => void}) => {
  return (
    <div>
      <Layout>
        <PreparationTitle>
          Migration Steps
        </PreparationTitle>
        <PreparationItemsContainer>
          {MIGRATION_PREPARATION.map((data: any, index: number) => <MigrationBlock stepNumber={data.stepNumber} key={index} title={data.title} text={data.text} />)}
        </PreparationItemsContainer>
      </Layout>
      <Buttons cancelAction={cancelHandler} acceptAction={goToNexStep} />
    </div>
  );
};

export default SecondStep;
