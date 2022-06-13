import {connect} from 'react-redux';
import React, {useEffect, useMemo, useState} from 'react';
import styled from 'styled-components';
import {Button, Checkbox} from '~app/common/components';
import useRouting from '~app/common/hooks/useRouting';
import useAccounts from '~app/components/Accounts/useAccounts';
import { handlePageClick } from '~app/common/components/Table/service';
import {getAddAnotherAccount} from '~app/components/Accounts/selectors';

import {BackButton, Link, Title} from '~app/components/Wizard/components/common';
import {setWizardPage, setWizardStep} from '~app/components/Wizard/actions';
import {getPage, getPageData, getStep, getWizardFinishedStatus} from '~app/components/Wizard/selectors';
import {Table} from '../../common/components';
import tableColumns from './tableColumns';
import KeyVaultService from '../../backend/services/key-vault/key-vault.service';

const Wrapper = styled.div`
  height: 100%;
  //margin-top: 64px;
  margin: 70px auto;
  flex-direction: column;
  //padding: 70px 150px 64px 150px;
  background-color: ${({theme}) => theme.gray50};
`;

const TableWrapper = styled.div`
  width: 600px;
`;

const Text = styled.span`
  display: block;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.14;
  font-family: Avenir, serif;
  color: ${({theme}) => theme.gray600};
`;

const TinyText = styled.span`
  display: block;
  font-size: 11px;
  font-weight: 500;
  line-height: 1.45;
  margin-bottom: 24px;
  color: ${({theme}) => theme.gray600};
`;

const SubmitButton = styled(Button)`
  width: 238px;
  height: 40px;
  padding: 6px 24px 8px;
`;

const RewardAddresses = (props: Props) => {
  props;
  const {accounts} = useAccounts();
  const {goToPage, ROUTES} = useRouting();
  const [checked, setChecked] = useState();
  const [validatorsPage, setPagedValidators] = useState([]);
  const [paginationInfo, setPaginationInfo] = useState({});
  const [addressesVerified, setAddressesVerified] = useState({});
  const [validatorsRewardAddresses, setValidatorRewardAddresses] = useState({});

  useEffect(() => {
    onPageClick(0);
  }, []);

  const buttonEnable = checked && Object.values(addressesVerified).filter(item => item).length === accounts.length;

  const verifyAddress = (inputValue: string, validatorAddress: string) => {
    const clonedObj = {...addressesVerified};
    clonedObj[validatorAddress] = inputValue.length === 42 && inputValue.startsWith('0x');
    if (inputValue.length === 0) delete clonedObj[validatorAddress];
    setAddressesVerified(clonedObj);
  };

  const verifyAddresses = (forceAddress: string, validatorAddresses: string[]) => {
    const clonedObj = {...addressesVerified};
    validatorAddresses.forEach((validatorAddress: string) => {
      clonedObj[validatorAddress] = forceAddress.length === 42 && forceAddress.startsWith('0x');
      if (forceAddress.length === 0) delete clonedObj[validatorAddress];
    });
    setAddressesVerified(clonedObj);
  };

  const submitRewardAddresses = async () => {
    if (buttonEnable) {
      const keyVaultService = new KeyVaultService();
      const response = await keyVaultService.getListAccountsRewardKeys();
      response.fee_recipients = {
        ...response.fee_recipients,
        ...validatorsRewardAddresses
      };
      await keyVaultService.setListAccountsRewardKeys(response);
    }
  };

  const onChangeAddress = (inputValue: string, publicKey) => {
    const clonedObj = {...validatorsRewardAddresses};
    clonedObj[publicKey] = inputValue;
    setValidatorRewardAddresses(clonedObj);
  };

  const applyToAll = (address: string) => {
    const addresses = accounts.map(account => account.publicKey);
    const rewardAddresses = addresses.reduce((prev: any, curr: any) => {
      // eslint-disable-next-line no-param-reassign
      prev[curr] = address;
      return prev;
    }, {});
    setValidatorRewardAddresses(rewardAddresses);
    verifyAddresses(address, addresses);
  };

  const onPageClick = (offset) => {
    handlePageClick(accounts, offset, setPagedValidators, setPaginationInfo, 5);
  };

  const memoizedColumns = useMemo(
    () => tableColumns({applyToAll, onChangeAddress, verifyAddress, validatorsRewardAddresses, addressesVerified}),
    [validatorsRewardAddresses, addressesVerified]
  );

  return (
    <Wrapper>
      <BackButton onClick={() => {
        goToPage(ROUTES.DASHBOARD);
      }} />
      <Title>Proposal Rewards Address</Title>
      <Text style={{marginBottom: 8}}>
        Please enter an Ethereum address in order to receive block proposal rewards for each of <br /> your
        validators. <Link style={{fontSize: 14, textDecoration: 'underline'}}>What are proposal rewards?</Link>
      </Text>
      <TinyText>
        Please note that standard rewards from performing other duties will remain to be credited to your validator
        balance.
      </TinyText>
      <TableWrapper>
        <Table
          withHeader
          isPagination
          data={validatorsPage}
          rowMinHeight={'33px'}
          navButtonWidth={'12%'}
          columns={memoizedColumns}
          onPageClick={onPageClick}
          paginationInfo={paginationInfo}
        />
      </TableWrapper>
      <Checkbox checked={checked} onClick={setChecked} checkboxStyle={{marginBottom: 24, marginTop: 9, marginRight: 8}}
        labelStyle={{marginBottom: 24, marginTop: 9}}>
        I confirm that I have access to the addresses above.
      </Checkbox>
      <SubmitButton
        isDisabled={!buttonEnable}
        onClick={submitRewardAddresses}
      >
        Next
      </SubmitButton>
    </Wrapper>
  );
};

const mapStateToProps = (state) => ({
  page: getPage(state),
  step: getStep(state),
  pageData: getPageData(state),
  addAnotherAccount: getAddAnotherAccount(state),
  isFinishedWizard: getWizardFinishedStatus(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  setPage: (page: any) => dispatch(setWizardPage(page)),
  setStep: (page: any) => dispatch(setWizardStep(page)),
});

type Props = {
  page: number;
  step: number;
  accounts: any;
  pageData: any;
  isFinishedWizard: boolean;
  addAnotherAccount: boolean;
  setPage: (page: number) => void;
  setStep: (page: number) => void;
  setPageData: (data: any) => void;
};

type Dispatch = (arg0: { type: string }) => any;

export default connect(mapStateToProps, mapDispatchToProps)(RewardAddresses);
