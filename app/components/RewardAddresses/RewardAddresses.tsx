import {connect} from 'react-redux';
import React, {useEffect, useMemo, useState} from 'react';
import styled from 'styled-components';
import Spinner from '~app/common/components/Spinner';
import useRouting from '~app/common/hooks/useRouting';
import { Checkbox} from '~app/common/components';
import { selectedSeedMode } from '~app/common/service';
import useAccounts from '~app/components/Accounts/useAccounts';
import { handlePageClick } from '~app/common/components/Table/service';
import {getAddAnotherAccount} from '~app/components/Accounts/selectors';
import { setWizardPage, setWizardStep} from '~app/components/Wizard/actions';
import {BackButton, Link, Title, BigButton} from '~app/components/Wizard/components/common';
import {getPage, getPageData, getStep, getWizardFinishedStatus} from '~app/components/Wizard/selectors';
import {Table} from '../../common/components';
import tableColumns from './tableColumns';
import KeyVaultService from '../../backend/services/key-vault/key-vault.service';
import useDashboardData from '../Dashboard/useDashboardData';
import useProcessRunner from '../ProcessRunner/useProcessRunner';
import config from '../../backend/common/config';
import {bindActionCreators} from 'redux';
import * as actionsFromWizard from '../Wizard/actions';
import {setAddAnotherAccount} from '../Accounts/actions';

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

const LoaderWrapper = styled.div`
  display:flex;
  max-width:500px;
  margin-top: 8px;
`;

const LoaderText = styled.span`
  margin-left: 11px;
  font-size: 12px;
  color: ${({ theme }) => theme.primary900};
`;

const RewardAddresses = (props: Props) => {
  const { setPage } = props;
  const {accounts} = useAccounts();
  const {goToPage, ROUTES} = useRouting();
  const [checked, setChecked] = useState();
  const { loadDataAfterNewAccount } = useDashboardData();
  const { isDone, processData } = useProcessRunner();
  const [isLoading, setIsLoading] = useState(false);
  const [validators, setValidators] = useState({});
  const [validatorsPage, setPagedValidators] = useState([]);
  const [paginationInfo, setPaginationInfo] = useState({});
  const [addressesVerified, setAddressesVerified] = useState({});
  const buttonEnable =
    checked &&
    !isLoading &&
    Object.values(addressesVerified).filter(item => item).length === Object.keys(validators).length;

  useEffect(() => {
    const keyVaultService = new KeyVaultService();
    keyVaultService.getListAccountsRewardKeys().then(response => {
      const newObject = (isDone ? processData : accounts).reduce((prev, curr) => {
        const rewardAddress = response.fee_recipients[curr.publicKey] ?? '';
        // eslint-disable-next-line no-param-reassign
        prev[curr.publicKey] = {rewardAddress, addressStatus: undefined};
        return prev;
      }, {});

      setValidators(newObject);
      onPageClick(0, newObject);
    });
  }, []);

  useEffect(() => {
    verifyAddresses();
  }, [validators]);

  const isAddressVerify = (address: string): boolean => {
    return address.length === 42 && address.startsWith('0x');
  };

  const verifyAddresses = () => {
    const clonedObj = {};
    Object.keys(validators).forEach((publicKey: string) => {
      clonedObj[publicKey] = validators[publicKey];
      const validatorRewardAddress = clonedObj[publicKey]?.rewardAddress;

      if (validatorRewardAddress?.length !== 0) {
        clonedObj[publicKey].addressStatus = isAddressVerify(validatorRewardAddress);
      }
    });
    setAddressesVerified(clonedObj);
  };

  const submitRewardAddresses = async () => {
    if (buttonEnable) {
      setIsLoading(true);
      const keyVaultService = new KeyVaultService();
      const response = await keyVaultService.getListAccountsRewardKeys();
      const newAddress = Object.keys(validators).reduce((prev: any, curr: string) => {
        prev[curr] = validators[curr].rewardAddress;
        return prev;
      }, {});
      response.fee_recipients = {
        ...response.fee_recipients,
        ...newAddress
      };
      await keyVaultService.setListAccountsRewardKeys(response);
      const redirect = selectedSeedMode() ? config.WIZARD_PAGES.VALIDATOR.CONGRATULATIONS : config.WIZARD_PAGES.VALIDATOR.STAKING_DEPOSIT;
      await setPage(redirect);
      setIsLoading(false);
    }
  };

  const onChangeAddress = (inputValue: string, publicKey) => {
    const clonedObj = {...validators};
    clonedObj[publicKey] = {...clonedObj[publicKey], rewardAddress: inputValue};
    setValidators(clonedObj);
  };

  const applyToAll = (address: string) => {
    const addresses = Object.keys(validators);
    const rewardAddresses = addresses.reduce((prev: any, curr: any) => {
      // eslint-disable-next-line no-param-reassign
      prev[curr] = {...validators[address], rewardAddress: address};
      return prev;
    }, {});

    setValidators(rewardAddresses);
  };

  const onPageClick = (offset, forceData?: object) => {
    handlePageClick(Object.keys(forceData ?? validators), offset, setPagedValidators, setPaginationInfo, 5);
  };

  const memoizedColumns = useMemo(
    () => tableColumns({applyToAll, onChangeAddress, validators}),
    [validators]
  );

  return (
    <Wrapper>
      <BackButton onClick={() => {
        loadDataAfterNewAccount().then(() => {
          goToPage(ROUTES.DASHBOARD);
        });
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
      <BigButton
        isDisabled={!buttonEnable}
        onClick={submitRewardAddresses}
      >
        Next
      </BigButton>
      {isLoading && (
        <LoaderWrapper>
          <Spinner width="17px" />
          <LoaderText>Declaring new addresses..</LoaderText>
        </LoaderWrapper>
      )}
    </Wrapper>
  );
};

const mapStateToProps = (state) => ({
  page: getPage(state),
  step: getStep(state),
  pageData: getPageData(state),
  addAnotherAccount: getAddAnotherAccount(state),
  isFinishedWizard: getWizardFinishedStatus(state),
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  setPage: (page: any) => dispatch(setWizardPage(page)),
});

type Props = {
  page: number;
  step: number;
  accounts: any;
  pageData: any;
  flowPage: boolean;
  isFinishedWizard: boolean;
  addAnotherAccount: boolean;
  setPage: (page: number) => void;
  setStep: (page: number) => void;
  setPageData: (data: any) => void;
  wizardActions: Record<string, any>;
};

type Dispatch = (arg0: { type: string }) => any;

export default connect(mapStateToProps, mapDispatchToProps)(RewardAddresses);
