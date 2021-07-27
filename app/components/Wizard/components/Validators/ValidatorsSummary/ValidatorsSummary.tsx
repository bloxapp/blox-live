import { connect } from 'react-redux';
import styled from 'styled-components';
import {bindActionCreators} from 'redux';
import React, { useEffect, useState } from 'react';
import config from '~app/backend/common/config';
import Table from '~app/common/components/Table';
import { Checkbox } from '~app/common/components';
import { handlePageClick } from '~app/common/components/Table/service';
import BloxApi from '~app/backend/common/communication-manager/blox-api';
import { getNetwork, getDecryptedKeyStores } from '~app/components/Wizard/selectors';
import { Title, Paragraph, Link, Warning, BackButton } from '~app/components/Wizard/components/common';
import tableColumns from './components/table-columns';
import * as actionsFromWizard from '../../../actions';

const Wrapper = styled.div`
  width:650px;
`;

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

const Button = styled.button<{ isDisabled }>`
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

const bloxApi = new BloxApi();
bloxApi.init();

const ValidatorsSummary = (props: ValidatorsSummaryProps) => {
  const { setPage, setStep, network, wizardActions, decryptedKeyStores } = props;
  const { clearDecryptKeyStores } = wizardActions;
  const [pagedValidators, setPagedValidators] = useState([]);
  const [paginationInfo, setPaginationInfo] = useState(null);
  const [allDeposited, setAllDeposited] = useState(false);
  const [isAgreementReadCheckbox, setAgreementReadCheckbox] = useState(false);
  const [isContinueButtonDisabled, setContinueButtonDisabled] = useState(false);
  const [allValidatorsHaveSameStatus, setAllValidatorsHaveSameStatus] = useState(true);
  const [isValidatorsOfflineCheckbox, setValidatorsOfflineCheckbox] = useState(false);
  const [validators, setValidators] = useState(decryptedKeyStores);
  const checkboxStyle = { marginRight: 5 };
  const checkboxLabelStyle = { fontSize: 12 };
  const privacyPolicyLink = 'https://www.bloxstaking.com/privacy-policy/';
  const serviceAgreementLink = 'https://www.bloxstaking.com/license-agreement/';
  const PAGE_SIZE = 5;

  const notTheSameError = 'Only batches of the same status are supported (“deposited” / “not deposited”). Please go back and adjust your validators\' uploaded keystore files (you could upload the rest later on).';

  const onPageClick = (offset) => {
    handlePageClick(validators, offset, setPagedValidators, setPaginationInfo, PAGE_SIZE);
  };

  const onLinkClick = (event) => {
    event.stopPropagation();
  };

  useEffect(() => {
    let notDepositedCount = 0;
    let depositedCount = 0;
    const publicKeys = [];
    validators.map((validator: any) => {
      if (validator.deposited) {
        depositedCount += 1;
      } else if (validator.deposited !== null) {
        notDepositedCount += 1;
      } else {
        publicKeys.push(validator.publicKey);
      }
      return validator;
    });

    setAllValidatorsHaveSameStatus(!(notDepositedCount > 0 && depositedCount > 0));
    setAllDeposited(depositedCount > 0);
    setContinueButtonDisabled(!(isValidatorsOfflineCheckbox && isAgreementReadCheckbox && allValidatorsHaveSameStatus));
    if (publicKeys.length > 0) { bloxApi.request('GET', `/ethereum2/validators-deposits/?network=${network}&publicKeys=${publicKeys.join(',')}`).then((deposits: any) => {
      const newValidatorsStatuses = validators.map((validator) => {
        const newValidator = { ...validator};
        if (deposits[validator.publicKey]) {
          newValidator.deposited = true;
        } else {
          newValidator.deposited = false;
        }
        return newValidator;
      });
      setValidators(newValidatorsStatuses);
    }); }
    onPageClick(0);
  }, [validators, isAgreementReadCheckbox, isValidatorsOfflineCheckbox, allValidatorsHaveSameStatus]);

  const onNextButtonClick = () => {
    if (allDeposited) {
      setPage(config.WIZARD_PAGES.VALIDATOR.SLASHING_WARNING);
    } else {
      setPage(config.WIZARD_PAGES.VALIDATOR.DEPOSIT_OVERVIEW);
    }
  };

  if (!paginationInfo) {
    onPageClick(0);
  }

  return (
    <Wrapper>
      <BackButton onClick={() => {
        setStep(config.WIZARD_STEPS.VALIDATOR_SETUP);
        setPage(config.WIZARD_PAGES.VALIDATOR.UPLOAD_KEYSTORE_FILE);
        clearDecryptKeyStores();
      }} />
      <Title>Validators Summary</Title>
      <Paragraph style={{ marginBottom: 10 }}>
        List of validators to be added:
      </Paragraph>
      <br />

      <TableWrapper>
        <Table
          data={pagedValidators}
          columns={tableColumns}
          withHeader
          onPageClick={onPageClick}
          isPagination
          paginationInfo={paginationInfo}
          totalCount={validators.length}
          sortType="disabled"
          navButtonWidth="15%"
          rowMinHeight="40px"
          headerHeight="40px"
          footerHeight="40px"
        />
      </TableWrapper>
      {!allValidatorsHaveSameStatus && <Warning style={{maxWidth: '100%', marginTop: '20px'}} text={notTheSameError} />}

      <Checkbox
        checked={isAgreementReadCheckbox}
        onClick={() => { setAgreementReadCheckbox(!isAgreementReadCheckbox); }}
        checkboxStyle={checkboxStyle}
        labelStyle={checkboxLabelStyle}
      >
        I agree to Blox&apos;s&nbsp;
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

      <Checkbox
        checked={isValidatorsOfflineCheckbox}
        onClick={() => { setValidatorsOfflineCheckbox(!isValidatorsOfflineCheckbox); }}
        checkboxStyle={checkboxStyle}
        labelStyle={checkboxLabelStyle}
      >
        I confirm that I haven&apos;t deposited any of my validators above.
      </Checkbox>

      <ButtonWrapper>
        <Button
          isDisabled={isContinueButtonDisabled}
          onClick={() => { !isContinueButtonDisabled && onNextButtonClick(); }}>
          Next
        </Button>
      </ButtonWrapper>
    </Wrapper>
  );
};

type ValidatorsSummaryProps = {
  page: number;
  setPage: (page: number) => void;
  step: number;
  setStep: (page: number) => void;
  setPageData: (data: any) => void;
  network: string;
  wizardActions: Record<string, any>;
  decryptedKeyStores: Array<any>,
};

const mapStateToProps = (state: any) => ({
  network: getNetwork(state),
  decryptedKeyStores: getDecryptedKeyStores(state),
});

const mapDispatchToProps = (dispatch) => ({
  wizardActions: bindActionCreators(actionsFromWizard, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(ValidatorsSummary);
