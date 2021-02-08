import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import styled from 'styled-components/dist/styled-components.esm';

import tableColumns from './table-columns';
import Table from 'common/components/Table';
import { getNetworkForImport } from './helpers';
import { Paragraph, Link } from '../../../common';
import { MODAL_TYPES } from '../../../../../Dashboard/constants';
import * as actionsFromDashboard from '../../../../../Dashboard/actions';
import useProcessRunner from '../../../../../ProcessRunner/useProcessRunner';
import { Checkbox, ProcessLoader } from '../../../../../../common/components';
import usePasswordHandler from '../../../../../PasswordHandler/usePasswordHandler';
import { handlePageClick } from '../../../../../../common/components/Table/service';

const TableWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  font-family: Avenir, serif;
  font-size: 16px;
  font-weight: 500;
`;

const ButtonWrapper = styled.div`
  margin-top:41px;
  margin-bottom:41px;
`;

const Button = styled.button`
  width: 238px;
  height: 40px;
  font-size: 14px;
  font-weight: 900;
  display:flex;
  align-items:center;
  justify-content:center;
  background-color: ${({theme, isDisabled}) => isDisabled ? theme.gray400 : theme.primary900};
  border-radius: 6px;
  color:${({theme}) => theme.gray50};
  border:0;
  cursor:${({isDisabled}) => isDisabled ? 'default' : 'pointer'};
`;

const ProgressWrapper = styled.div`
  width:238px;
  margin-top:20px;
`;

type ImportedValidatorsListProps = {
  show: boolean,
  validators: any[],
  onDone: () => void;
  dashboardActions: any;
};

const ImportedValidatorsList = ({ show, validators, onDone, dashboardActions }: ImportedValidatorsListProps) => {
  // Don't show component if not allowed to show or nothing to show
  if (!show || !validators || !validators.length) {
    return null;
  }

  const PAGE_SIZE = 5;
  const checkboxStyle = { marginRight: 5 };
  const checkboxLabelStyle = { fontSize: 12 };
  const privacyPolicyLink = 'https://www.bloxstaking.com/privacy-policy/';
  const serviceAgreementLink = 'https://www.bloxstaking.com/license-agreement/';

  const [processMessage, setProcessMessage] = useState('');
  const [pagedValidators, setPagedValidators] = useState([]);
  const [paginationInfo, setPaginationInfo] = useState(null);
  const [isAgreementReadCheckbox, setAgreementReadCheckbox] = useState(false);
  const [isValidatorsOfflineCheckbox, setValidatorsOfflineCheckbox] = useState(false);

  const { setModalDisplay } = dashboardActions;
  const { checkIfPasswordIsNeeded } = usePasswordHandler();
  const { isLoading, isDone, processData, error, startProcess, clearProcessState, loaderPercentage } = useProcessRunner();

  const onPageClick = (offset) => {
    handlePageClick(validators, offset, setPagedValidators, setPaginationInfo, PAGE_SIZE);
  };

  const onLinkClick = (event) => {
    event.stopPropagation();
  };

  useEffect(() => {
    if (isDone && processData && !error) {
      onDone();
    } else if (isDone && error && !isLoading) {
      setModalDisplay({ show: true, type: MODAL_TYPES.VALIDATORS_IMPORT_FAILED });
    }
  }, [isLoading, processData, error]);

  const onCreateAccountButtonClick = () => {
    const onSuccess = () => {
      if (error) {
        clearProcessState();
      }
      if (!isLoading) {
        startProcess(
          'createAccount',
          'Creating account..',
          null,
          getNetworkForImport(),
          validators.length - 1
        );
        setProcessMessage('Importing validator(s)');
      }
    };
    checkIfPasswordIsNeeded(onSuccess);
  };

  if (!paginationInfo) {
    onPageClick(0);
  }

  const isContinueButtonDisabled = !(isValidatorsOfflineCheckbox && isAgreementReadCheckbox) || (isLoading && !isDone);

  return (
    <>
      <Paragraph>List of Validator(s) to be imported:</Paragraph>
      <TableWrapper>
        <Table
          data={pagedValidators}
          columns={tableColumns}
          withHeader
          onPageClick={onPageClick}
          isPagination
          paginationInfo={paginationInfo}
          totalCount={validators.length}
        />
      </TableWrapper>

      <Checkbox
        disabled={isLoading}
        checked={isValidatorsOfflineCheckbox}
        onClick={() => { setValidatorsOfflineCheckbox(!isValidatorsOfflineCheckbox); }}
        checkboxStyle={checkboxStyle}
        labelStyle={checkboxLabelStyle}
      >
        I&apos;m aware that before importing, to avoid slashing risks, my validator needs to be offline
      </Checkbox>

      <Checkbox
        disabled={isLoading}
        checked={isAgreementReadCheckbox}
        onClick={() => { setAgreementReadCheckbox(!isAgreementReadCheckbox); }}
        checkboxStyle={checkboxStyle}
        labelStyle={checkboxLabelStyle}
      >
        I agree to Blox’s&nbsp;
        <Link
          onClick={onLinkClick}
          href={privacyPolicyLink}
        >
          Privacy Policy
        </Link>
        &nbsp;and&nbsp;
        <Link
          onClick={onLinkClick}
          href={serviceAgreementLink}
        >
          License and Service Agreement
        </Link>
      </Checkbox>

      <ButtonWrapper>
        <Button
          isDisabled={isContinueButtonDisabled}
          onClick={() => { !isContinueButtonDisabled && onCreateAccountButtonClick(); }}>
          Continue
        </Button>

        {isLoading && processMessage && !error && !isDone && (
          <ProgressWrapper>
            <ProcessLoader text={processMessage} precentage={loaderPercentage} />
          </ProgressWrapper>
        )}
      </ButtonWrapper>
    </>
  );
};

type Dispatch = (arg0: { type: string }) => any;

const mapDispatchToProps = (dispatch: Dispatch) => ({
  dashboardActions: bindActionCreators(actionsFromDashboard, dispatch)
});

export default connect(null, mapDispatchToProps)(ImportedValidatorsList);
