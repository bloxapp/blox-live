import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import config from '~app/backend/common/config';
import Table from '~app/common/components/Table';
import { Checkbox } from '~app/common/components';
import { getNetwork } from '~app/components/Wizard/selectors';
import { handlePageClick } from '~app/common/components/Table/service';
import BloxApi from '~app/backend/common/communication-manager/blox-api';
import BackButton from '~app/components/Wizard/components/common/BackButton';
import { Title, Paragraph, Link } from '~app/components/Wizard/components/common';
import tableColumns from './components/table-columns';

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
  const { setPage, setStep, network } = props;
  const [pagedValidators, setPagedValidators] = useState([]);
  const [paginationInfo, setPaginationInfo] = useState(null);
  const [isAgreementReadCheckbox, setAgreementReadCheckbox] = useState(false);
  const [isContinueButtonDisabled, setContinueButtonDisabled] = useState(false);
  const [allValidatorsHaveSameStatus, setAllValidatorsHaveSameStatus] = useState(false);
  const [isValidatorsOfflineCheckbox, setValidatorsOfflineCheckbox] = useState(false);
  const checkboxStyle = { marginRight: 5 };
  const checkboxLabelStyle = { fontSize: 12 };
  const privacyPolicyLink = 'https://www.bloxstaking.com/privacy-policy/';
  const serviceAgreementLink = 'https://www.bloxstaking.com/license-agreement/';
  const PAGE_SIZE = 5;
  const validators = [
    { publicKey: '80001866ce324de7d80ec73be15e2d064dcf121adf1b34a0d679f2b9ecbab40ce021e03bb877e1a2fe72eaaf475e6e21', privateKey: '111', deposited: null },
    { publicKey: '8002001dedaa9cc2842ecec377836aab68b76dae6fbfd9d8c297c28be80f58383b3298dfb2d5b52a3888883ac0513bf4', privateKey: '222', deposited: null },
    { publicKey: '0x123123123123123123123123123123123123123123123', privateKey: '333', deposited: null },
    { publicKey: '0x123123123123123123123123123123123123123123123', privateKey: '444', deposited: null },
    { publicKey: '0x123123123123123123123123123123123123123123123', privateKey: '555', deposited: null },
    { publicKey: '0x123123123123123123123123123123123123123123123', privateKey: '666', deposited: null },
    { publicKey: '0x123123123123123123123123123123123123123123123', privateKey: '777', deposited: null },
    { publicKey: '0x123123123123123123123123123123123123123123123', privateKey: '888', deposited: null },
    { publicKey: '0x123123123123123123123123123123123123123123123', privateKey: '999', deposited: null },
    { publicKey: '0x123123123123123123123123123123123123123123123', privateKey: '101', deposited: null },
  ];

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
    setAllValidatorsHaveSameStatus(validators.length === notDepositedCount || validators.length === depositedCount);
    setContinueButtonDisabled(!(isValidatorsOfflineCheckbox && isAgreementReadCheckbox && allValidatorsHaveSameStatus));
    bloxApi.request('GET', `/ethereum2/validators-deposits/?network=${network}&publicKeys=${publicKeys.join(',')}`).then((deposits: any) => {

    });
    // TODO: make waterfall requests to beaconchain api to get deposited status
    //  https://pyrmont.beaconcha.in/api/v1/validator/{validatorPublicKey}/deposits
    //  data.amount should be not null and data.tx_hash too
    //  if data is empty array - it is not deposited (=== false)
    //  if not checked yet - deposited remains null
    //  use BeaconchaApi class
  }, [validators]);

  const onNextButtonClick = () => {
    alert('Implement next button');
  };

  if (!paginationInfo) {
    onPageClick(0);
  }

  return (
    <Wrapper>
      <BackButton onClick={() => {
        setStep(config.WIZARD_STEPS.VALIDATOR_SETUP);
        setPage(config.WIZARD_PAGES.VALIDATOR.UPLOAD_KEYSTORE_FILE);
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
};

const mapStateToProps = (state: any) => ({
  network: getNetwork(state),
});

export default connect(mapStateToProps, null)(ValidatorsSummary);
