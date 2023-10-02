import React, {useState} from 'react';
import {Layout} from '~app/components/Migration/styles';
import Buttons from '~app/components/Migration/Buttons/Buttons';
import MigrationBlock from '~app/components/Migration/MigrationBlock/MigrationBlock';
import {PreparationItemsContainer, PreparationTitle} from '~app/components/Migration/Preparation/styles';

const MIGRATION_PREREQUISITES = [
  {
    title: '20-30 minutes',
    text: 'Allocate 20-30 minutes to complete the migration process without interruptions. This ensures you can follow each step carefully and avoid any potential issues.',
    checkboxText: 'My schedule is clear '
  }, {
    title: 'Ethereum wallet ',
    text: 'This wallet will be used to register your validator on the SSV Network. Make sure you have access to it anf that it has enough ETH for gas fees.',
    checkboxText: 'I have an Ethereum wallet ready '
  }, {
    title: '{Amount} SSV tokens',
    text: 'Will be used to pay  the operators that will run your validators and the network fee',
    checkboxText: 'I have X SSV token in my wallet and ETH for gas Fees',
    link: 'Where to buy SSV?',
  },
];

const FirstStep = ({goToNexStep, cancelHandler}: {goToNexStep: () => void, cancelHandler: () => void}) => {
  const [checksToContinue, setChecksToContinue] = useState([false, false, false]);
  const [buttonDisable, setButtonDisable] = useState(true);

  const onCheckboxChangeHandler = (checkboxId: string, result: boolean) => {
    setChecksToContinue(prevState => {
      const newCheckboxResult = [...prevState];
      newCheckboxResult[checkboxId] = result;
      setButtonDisable(newCheckboxResult.some(condition => !condition));
      return newCheckboxResult;
    });
  };

  return (
    <div>
      <Layout>
        <PreparationTitle>
          Migration Prerequisites
        </PreparationTitle>
        <PreparationItemsContainer>
          {MIGRATION_PREREQUISITES.map((data: any, index: number) => <MigrationBlock key={index} title={data.title} text={data.text} checkboxText={data.checkboxText} link={data.link} checkboxId={index} isChecked={checksToContinue[index]} onChangeHandler={onCheckboxChangeHandler} />)}
        </PreparationItemsContainer>
      </Layout>
      <Buttons secondButtonLabel={'I\'ll do it later'} acceptAction={goToNexStep} disabled={buttonDisable} cancelAction={cancelHandler} />
    </div>
  );
};

export default FirstStep;
