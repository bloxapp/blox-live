import { connect } from 'react-redux';
import styled from 'styled-components';
import { bindActionCreators } from 'redux';
import React, { useEffect, useMemo, useState } from 'react';
import Spinner from '~app/common/components/Spinner';
import useRouting from '~app/common/hooks/useRouting';
import { Table, Checkbox } from '~app/common/components';
import { setWizardPage} from '~app/components/Wizard/actions';
// import useAccounts from '~app/components/Accounts/useAccounts';
// import { MODAL_TYPES } from '~app/components/Dashboard/constants';
import { PROCESSES } from '~app/components/ProcessRunner/constants';
import Connection from '~app/backend/common/store-manager/connection';
import { handlePageClick } from '~app/common/components/Table/service';
// import WalletService from '~app/backend/services/wallet/wallet.service';
import * as actionsFromDashboard from '~app/components/Dashboard/actions';
// import useDashboardData from '~app/components/Dashboard/useDashboardData';
import useProcessRunner from '~app/components/ProcessRunner/useProcessRunner';
import tableColumns from '~app/components/WithdrawalAddressesReview/tableColumns';
import usePasswordHandler from '~app/components/PasswordHandler/usePasswordHandler';
import { BackButton, Title, BigButton } from '~app/components/Wizard/components/common';
import { getAddAnotherAccount, getSeedlessDepositNeededStatus } from '~app/components/Accounts/selectors';
import { getPage, getPageData, getStep, getWizardFinishedStatus } from '~app/components/Wizard/selectors';
import Warning from '../Wizard/components/common/Warning';

const Wrapper = styled.div`
  height: 100%;
  //margin-top: 64px;
  margin: 70px auto;
  flex-direction: column;
  //padding: 70px 150px 64px 150px;
  background-color: ${({theme}) => theme.gray50};
`;

const TableWrapper = styled.div`
  width: 800px;
  border-radius: 4px;
  background-color: ${({theme}) => theme.gray300}!important;
  * {
    background-color: ${({theme}) => theme.gray100}!important;
    border-color: ${({theme}) => theme.gray300}!important;
  }
`;

const ErrorMessage = styled.span`
  font-size: 12px;
  font-weight: 900;
  line-height: 1.67;
  color: ${({theme}) => theme.destructive600};
  bottom:${({title}) => title ? '-27px' : '10px'};
`;

const LoaderWrapper = styled.div`
  display:flex;
  max-width:500px;
  margin-top: 8px;
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

const LoaderText = styled.span`
  margin-left: 11px;
  font-size: 12px;
  color: ${({ theme }) => theme.primary900};
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

const WithdrawalAddressesReview = (props: Props) => {
  const {
    // dashboardActions,
    walletNeedsUpdate, pageData } = props;
  const { goToPage, ROUTES } = useRouting();
  const [checked1, setChecked1] = useState(false);
  const [checked2, setChecked2] = useState(false);
  // const { loadDataAfterNewAccount } = useDashboardData();
  const { checkIfPasswordIsNeeded } = usePasswordHandler();
  const [validators, setValidators] = useState({});
  const [paginationInfo, setPaginationInfo] = useState({});
  const [validatorsPage, setPagedValidators] = useState([]);
  // const { setModalDisplay, clearModalDisplayData } = dashboardActions;
  const { isLoading, isDone, error, startProcess } = useProcessRunner();
  const [isSubmitButtonDisabled, setSubmitButtonDisabled] = useState(true);

  const initAccounts = () => {
    // Get initial accounts list which is suitable for the flow
    const verifiedValidators = pageData?.verifiedValidators || {};
    const tableData: any = Object.values(verifiedValidators).reduce((prev: any, curr: any) => {
      // eslint-disable-next-line no-param-reassign
      prev[curr?.publicKey] = curr;
      return prev;
    }, {});

    setValidators(tableData);
    onPageClick(0, tableData);
  };

  /**
   * If wallet needs update - show this dialog
   */
  // @ts-ignore
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
      validators,
      valueField: 'toExecutionAddress',
    }),
    [validators]
  );

  /**
   * Final method which runs the process of setting withdrawal addresses.
   */
  const setWithdrawalAddresses = async () => {
    // Sync vault config with blox
    // const walletService = new WalletService();
    // await walletService.syncVaultConfigWithBlox();

    console.warn({
      seed: Connection.db().get('seed'),
    });

    startProcess(
      PROCESSES.SET_WITHDRAWAL_ADDRESSES,
      '',
      {
        seed: Connection.db().get('seed'),
        accounts: Object.values(validators),
      }
    );
  };

  const onSubmitButtonClick = async () => {
    // Show wallet update dialog if required to update
    if (walletNeedsUpdate) {
      // TODO: uncomment this when flow is tested
      // return showWalletUpdateDialog();
    }

    // TODO: enable this only when at least one toExecutionAddress has been specified with correct data
    // TODO: save final data with addresses to separate storage to work with it further

    // TODO: check if password is required again
    // TODO: and navigate to final execution screen with process inside
    checkIfPasswordIsNeeded(setWithdrawalAddresses);
  };

  const checkSubmitButtonState = () => {
    setSubmitButtonDisabled((isLoading && !isDone) || !checked1 || !checked2);
  };

  useEffect(() => {
    checkSubmitButtonState();
  }, [isLoading, isDone, checked1, checked2]);

  // Initialize first table state
  useEffect(() => {
    initAccounts();
  }, [pageData]);

  return (
    <Wrapper>
      {!props.flowPage && (
        <>
          <BackButton onClick={() => {
            goToPage(ROUTES.WITHDRAWAL_ADDRESSES);
          }} />
          <br />
        </>
      )}

      <Title>Withdrawal Address Summary</Title>

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

      <br />

      <Warning
        style={{marginBottom: 16, width: '100%', maxWidth: 'fit-content'}}
        text={'The process of setting a withdrawal address is irreversible and could not be changed in the future - please ensure that you control the provided addresses, as lack of access would result in permanent lost of staked funds.'}
      />

      <Checkbox checked={checked1} onClick={setChecked1} checkboxStyle={{marginBottom: 0, marginTop: 9, marginRight: 8}}
        labelStyle={{marginBottom: 0, marginTop: 9}}>
        I confirm that I have access to the addresses above.
      </Checkbox>

      <Checkbox checked={checked2} onClick={setChecked2} checkboxStyle={{marginBottom: 0, marginTop: 9, marginRight: 8}}
        labelStyle={{marginBottom: 32, marginTop: 9}}>
        I understand that once I set withdrawal addresses, they can not be changed in the future.
      </Checkbox>

      <SubmitButton
        isDisabled={isSubmitButtonDisabled}
        onClick={() => { !isSubmitButtonDisabled && onSubmitButtonClick(); }}
      >
        Next
      </SubmitButton>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {isLoading && (
        <LoaderWrapper>
          <Spinner width="17px" />
          <LoaderText>Saving withdrawal addresses..</LoaderText>
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
  seedLessNeedDeposit: getSeedlessDepositNeededStatus(state),
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  setPage: (page: any) => dispatch(setWizardPage(page)),
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

export default connect(mapStateToProps, mapDispatchToProps)(WithdrawalAddressesReview);
