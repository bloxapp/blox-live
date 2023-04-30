import Web3 from 'web3';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { bindActionCreators } from 'redux';
import React, { useEffect, useMemo, useState } from 'react';
import { Table } from '~app/common/components';
import config from '~app/backend/common/config';
import Spinner from '~app/common/components/Spinner';
import useRouting from '~app/common/hooks/useRouting';
import useAccounts from '~app/components/Accounts/useAccounts';
// import { MODAL_TYPES } from '~app/components/Dashboard/constants';
import Connection from '~app/backend/common/store-manager/connection';
import { handlePageClick } from '~app/common/components/Table/service';
import * as actionsFromDashboard from '~app/components/Dashboard/actions';
import useDashboardData from '~app/components/Dashboard/useDashboardData';
import tableColumns from '~app/components/WithdrawalAddresses/tableColumns';
import { setWizardPage, setWizardPageData } from '~app/components/Wizard/actions';
// import usePasswordHandler from '~app/components/PasswordHandler/usePasswordHandler';
import { BackButton, Title, BigButton } from '~app/components/Wizard/components/common';
import { getAddAnotherAccount, getSeedlessDepositNeededStatus } from '~app/components/Accounts/selectors';
import { getPage, getPageData, getStep, getWizardFinishedStatus } from '~app/components/Wizard/selectors';

const web3 = new Web3(config.env.DEFAULT_WEB3_HTTP_PROVIDER);

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

const ValidatorsLoaderWrapper = styled.div`
  display:flex;
  padding: 20px;
  align-self: center;
`;

const ValidatorsLoaderText = styled.span`
  font-size: 14px;
  font-weight: 500;
  margin-right: 12px;
  color: ${({theme}) => theme.gray800};
`;

const SubmitButton = styled(BigButton)`
  width: 238px;
  height: 40px;
  font-size: 16px;
  font-weight: 900;
  line-height: 1.75;
  text-align: center;
  font-style: normal;
  font-stretch: normal;
  padding: 6px 24px 8px;
  letter-spacing: normal;
  color: ${({theme}) => theme.gray50};
  cursor: ${({isDisabled}) => (isDisabled ? 'default' : 'pointer')};
  background-color: ${({ theme, isDisabled }) => isDisabled ? theme.gray400 : theme.primary900};
`;

const WithdrawalAddresses = (props: Props) => {
  const { accounts } = useAccounts();
  // const { dashboardActions } = props;
  const { goToPage, ROUTES } = useRouting();
  const { loadDataAfterNewAccount } = useDashboardData();
  // const { checkIfPasswordIsNeeded } = usePasswordHandler();
  const [validators, setValidators] = useState({});
  const { walletNeedsUpdate, pageData, setPageData } = props;
  const [paginationInfo, setPaginationInfo] = useState({});
  const [validatorsPage, setPagedValidators] = useState([]);
  // const { setModalDisplay, clearModalDisplayData } = dashboardActions;
  const [verifiedValidators, setVerifiedValidators] = useState({});
  const [isSubmitButtonDisabled, setSubmitButtonDisabled] = useState(true);

  const initAccounts = () => {
    // Get initial accounts list which is suitable for the flow
    let initialAccounts = [];
    if (pageData?.verifiedValidators) {
      initialAccounts = Object.values(pageData?.verifiedValidators);
    } else {
      initialAccounts = accounts;
    }

    initialAccounts = initialAccounts
      .filter(item => item.network === Connection.db().get('network'))
      .filter(item => item.withdrawalKey && item.withdrawalKey.startsWith('0x00'));

    const tableData = initialAccounts.reduce((prev, curr) => {
      // eslint-disable-next-line no-param-reassign
      prev[curr?.publicKey] = curr;
      return prev;
    }, {});

    setValidators(tableData);
    onPageClick(0, tableData);
  };

  /**
   * To execution address validator function
   * @param address
   */
  const validateToExecutionAddress = (address: string): boolean => {
    try {
      return web3.utils.isAddress(address);
    } catch {
      return false;
    }
  };

  /**
   * Verify to execution address
   * TODO: as in on screen https://zpl.io/g8Ll5XA
   *       show inline error without erasing bad data
   */
  const validateToExecutionAddresses = () => {
    const newVerifiedValidators = {};
    Object.keys(validators).forEach((publicKey: string) => {
      const toExecutionAddress = validators[publicKey]?.toExecutionAddress;
      const invalidAddress = !validateToExecutionAddress(toExecutionAddress);
      if (toExecutionAddress?.length && invalidAddress) {
        validators[publicKey] = {
          ...validators[publicKey],
          error: 'Invalid address'
        };
        delete newVerifiedValidators[publicKey];
      } else if (toExecutionAddress?.length) {
        validators[publicKey] = {
          ...validators[publicKey],
          error: null,
        };
        newVerifiedValidators[publicKey] = {
          ...validators[publicKey],
          error: null,
        };
      }
    });
    setVerifiedValidators(newVerifiedValidators);
  };

  /**
   * If wallet needs update - show this dialog
   */
  // const showWalletUpdateDialog = () => {
  //   setModalDisplay({
  //     show: true,
  //     type: MODAL_TYPES.UPDATE_KEYVAULT_REQUEST,
  //     text: 'Please update your KeyVault before adding reward addresses',
  //     confirmation: {
  //       title: 'Update KeyVault',
  //       confirmButtonText: 'Update KeyVault',
  //       cancelButtonText: 'Later',
  //       onConfirmButtonClick: () => {
  //         checkIfPasswordIsNeeded(async () => {
  //           setModalDisplay({ show: true, type: MODAL_TYPES.UPDATE });
  //         });
  //       },
  //       onCancelButtonClick: () => clearModalDisplayData()
  //     }
  //   });
  // };

  /**
   * Change address callback
   * @param toExecutionAddress
   * @param publicKey
   */
  const onChangeToExecutionAddress = (toExecutionAddress: string, publicKey: string) => {
    const clonedObj = {...validators};
    clonedObj[publicKey] = {...clonedObj[publicKey], toExecutionAddress };
    setValidators(clonedObj);
  };

  /**
   * Apply input to all the entries in a table.
   * @param address
   */
  const applyToAll = (address: string) => {
    if (!address?.length) {
      return;
    }
    const addresses = Object.keys(validators);
    const rewardAddresses = addresses.reduce((prev: any, curr: any) => {
      const validator = validators[curr];
      validator.toExecutionAddress = address;
      // eslint-disable-next-line no-param-reassign
      prev[curr] = validator;
      return prev;
    }, {});

    setValidators(rewardAddresses);
  };

  /**
   * Table page change callback
   * @param offset
   * @param forceData
   */
  const onPageClick = (offset, forceData?: object) => {
    handlePageClick(Object.keys(forceData ?? validators), offset, setPagedValidators, setPaginationInfo, 5);
  };

  /**
   * Make faster to work with table data
   */
  const memoizedColumns = useMemo(
    () => tableColumns({
      applyToAll,
      validators,
      valueField: 'toExecutionAddress',
      onChangeAddress: onChangeToExecutionAddress,
    }),
    [validators]
  );

  /**
   * Final submit button handler
   */
  const onSubmitButtonClick = async () => {
    // Show wallet update dialog if required to update
    if (walletNeedsUpdate) {
      // TODO: uncomment when done with the flow
      // return showWalletUpdateDialog();
    }

    // Go to review page with final data
    setPageData({ verifiedValidators });
    goToPage(ROUTES.WITHDRAWAL_ADDRESSES_REVIEW);
  };

  const checkSubmitButtonState = () => {
    const disabled = !Object.keys(verifiedValidators).length ||
      Object.keys(verifiedValidators).length !== Object.keys(validators).length;
    setSubmitButtonDisabled(disabled);
  };

  useEffect(() => {
    checkSubmitButtonState();
  }, [verifiedValidators, validators]);

  // Validation effects
  useEffect(() => {
    validateToExecutionAddresses();
  }, [validators]);

  // Initialize first table state
  useEffect(() => {
    initAccounts();
  }, []);

  return (
    <Wrapper>
      {!props.flowPage && (
        <>
          <BackButton onClick={() => {
            loadDataAfterNewAccount().then(() => {
              goToPage(ROUTES.DASHBOARD);
            });
            goToPage(ROUTES.DASHBOARD);
          }} />
          <br />
        </>
      )}

      <Title>Withdrawal Address</Title>

      <Text style={{marginBottom: 16}}>
        Please enter an Ethereum address for each of your validators, in order to enable withdrawals.
      </Text>

      <Text style={{marginBottom: 24}}>
        Setting a withdrawal address will make you eligible to participate in partial withdrawals and
        <br /> will not exit your validator (which could be performed through a dedicated interface afterwards).
      </Text>

      <TableWrapper>
        <Table
          withHeader
          isPagination
          withBlueHover
          data={validatorsPage}
          rowMinHeight={'33px'}
          navButtonWidth={'12%'}
          columns={memoizedColumns}
          onPageClick={onPageClick}
          paginationInfo={paginationInfo}
          customLoader={(
            <ValidatorsLoaderWrapper>
              <ValidatorsLoaderText>fetching validators</ValidatorsLoaderText>
              <Spinner height="17px" width="17px" />
            </ValidatorsLoaderWrapper>
          )}
        />
      </TableWrapper>

      <br /><br />

      <SubmitButton
        isDisabled={isSubmitButtonDisabled}
        onClick={() => { !isSubmitButtonDisabled && onSubmitButtonClick(); }}
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
  isFinishedWizard: getWizardFinishedStatus(state),
  seedLessNeedDeposit: getSeedlessDepositNeededStatus(state),
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  setPage: (page: any) => dispatch(setWizardPage(page)),
  setPageData: (data: any) => dispatch(setWizardPageData(data)),
  dashboardActions: bindActionCreators(actionsFromDashboard, dispatch)
});

type Props = {
  page: number;
  step: number;
  accounts: any;
  pageData: any;
  dashboardActions: any,
  flowPage: boolean;
  isFinishedWizard: boolean;
  walletNeedsUpdate: boolean,
  addAnotherAccount: boolean;
  seedLessNeedDeposit: boolean;
  setPage: (page: number) => void;
  setStep: (page: number) => void;
  setPageData: (data: any) => void;
  wizardActions: Record<string, any>;
};

type Dispatch = (arg0: { type: string }) => any;

export default connect(mapStateToProps, mapDispatchToProps)(WithdrawalAddresses);
