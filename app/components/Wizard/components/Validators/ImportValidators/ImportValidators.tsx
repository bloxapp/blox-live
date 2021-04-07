import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components/dist/styled-components.esm';
import config from '~app/backend/common/config';
import { Title } from '~app/components/Wizard/components/common';
import BackButton from '~app/components/Wizard/components/common/BackButton';
import useProcessRunner from '~app/components/ProcessRunner/useProcessRunner';
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
  const { setPage, setPageData } = props;
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
      setPage(config.WIZARD_PAGES.WALLET.IMPORT_MNEMONIC);
    }
  };

  useEffect(() => {
    if (finishedImport) {
      setPageData({
        isImportValidators: true,
        importedValidatorsCount: validators.length
      });
      setPage(config.WIZARD_PAGES.VALIDATOR.CONGRATULATIONS);
    }
  }, [finishedImport]);

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
    </ImportValidatorsWrapper>
  );
};

type Props = {
  page: number;
  setPage: (page: number) => void;
  setPageData: (data: any) => void;
};

export default connect(null, null)(ImportValidators);
