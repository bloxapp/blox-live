import React, { useState } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components/dist/styled-components.esm';

import { Title } from '../../common';
import BackButton from '../../common/BackButton';
import CongratulationPage from '../CongratulationPage';
import useProcessRunner from '../../../../ProcessRunner/useProcessRunner';
import { EnterValidatorsNumber, ImportedValidatorsList } from './components';

const ImportValidatorsWrapper = styled.div`
  width: 100%;
  max-width:560px;
  height: 100%;
  display: flex;
  flex-direction: column;
  font-family: Avenir, serif;
  font-size: 16px;
  font-weight: 500;
`;

const ImportValidators = (props: Props) => {
  const { page, setPage } = props;
  const { isLoading } = useProcessRunner();
  const [validators, setValidators] = useState([]);
  const [finishedImport, finishImport] = useState(false);

  /**
   * Back button handler for all the steps
   */
  const onBackButtonClick = () => {
    if (validators && validators.length) {
      // We already on validators list screen
      // Back button should show validators number input
      setValidators([]);
    } else {
      // We just in the beginning, should go back to import seed screen (mnemonic input)
      setPage(page - 1);
    }
  };

  return (
    <ImportValidatorsWrapper>
      { !finishedImport && (
        <>
          {!isLoading && <BackButton onClick={onBackButtonClick} />}
          <Title>Validator Selection</Title>

          <EnterValidatorsNumber
            show={!validators || !validators.length}
            setValidators={setValidators}
          />

          <ImportedValidatorsList
            show={validators && !!validators.length}
            validators={validators}
            onDone={() => { finishImport(true); }}
          />
        </>
      )}

      { finishedImport && (
        <CongratulationPage
          {...props}
          isImportValidators
          importedValidatorsCount={validators.length}
        />
      ) }

    </ImportValidatorsWrapper>
  );
};

type Props = {
  page: number;
  setPage: (page: number) => void;
};

export default connect(null, null)(ImportValidators);
