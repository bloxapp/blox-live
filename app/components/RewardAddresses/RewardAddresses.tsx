import Web3 from 'web3';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import config from '~app/backend/common/config';
import Spinner from '~app/common/components/Spinner';
import useRouting from '~app/common/hooks/useRouting';
import { selectedSeedMode } from '~app/common/service';
import { Table, Checkbox } from '~app/common/components';
import { isVersionHigherOrEqual } from '~app/utils/service';
import { setWizardPage} from '~app/components/Wizard/actions';
import useAccounts from '~app/components/Accounts/useAccounts';
import { MODAL_TYPES } from '~app/components/Dashboard/constants';
import { openExternalLink } from '~app/components/common/service';
import Connection from '~app/backend/common/store-manager/connection';
import { handlePageClick } from '~app/common/components/Table/service';
import WalletService from '~app/backend/services/wallet/wallet.service';
import tableColumns from '~app/components/RewardAddresses/tableColumns';
import * as actionsFromDashboard from '~app/components/Dashboard/actions';
import useDashboardData from '~app/components/Dashboard/useDashboardData';
import useProcessRunner from '~app/components/ProcessRunner/useProcessRunner';
import KeyVaultService from '~app/backend/services/key-vault/key-vault.service';
import usePasswordHandler from '~app/components/PasswordHandler/usePasswordHandler';
import { BackButton, Link, Title, BigButton } from '~app/components/Wizard/components/common';
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

const ErrorMessage = styled.span`
  font-size: 12px;
  font-weight: 900;
  line-height: 1.67;
  color: ${({theme}) => theme.destructive600};
  bottom:${({title}) => title ? '-27px' : '10px'};
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

const RewardAddresses = (props: Props) => {
  const { setPage, dashboardActions, walletNeedsUpdate } = props;
  const {accounts} = useAccounts();
  const {goToPage, ROUTES} = useRouting();
  const [checked, setChecked] = useState();
  const [error, showError] = useState('');
  const { isDone, processData } = useProcessRunner();
  const { loadDataAfterNewAccount } = useDashboardData();
  const { checkIfPasswordIsNeeded } = usePasswordHandler();
  const [validators, setValidators] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { setModalDisplay, clearModalDisplayData } = dashboardActions;
  const [paginationInfo, setPaginationInfo] = useState({});
  const [validatorsPage, setPagedValidators] = useState([]);
  const [addressesVerified, setAddressesVerified] = useState({});
  const [keyVaultConfigData, setKeyVaultConfigData] = useState({});
  const buttonEnable =
    checked &&
    !isLoading &&
    Object.values(addressesVerified).filter(item => item).length === Object.keys(validators).length;

  useEffect(() => {
    const keyVaultService = new KeyVaultService();
    const keyVaultVersion = Connection.db().get('keyVaultVersion');
    if (isVersionHigherOrEqual(keyVaultVersion, config.env.MERGE_SUPPORTED_TAG)) {
      keyVaultService.getListAccountsRewardKeys().then(response => {
        initAccounts(response);
        setKeyVaultConfigData(response?.fee_recipients);
      }).catch((e) => {
        console.log('<<<<<<<<<<<<<<<<<<<<<<<<<error>>>>>>>>>>>>>>>>>>>>>>>>>');
        console.log(e.message);
        console.log('<<<<<<<<<<<<<<<<<<<<<<<<<error>>>>>>>>>>>>>>>>>>>>>>>>>');
      });
    } else {
      initAccounts({});
    }
  }, []);

  const initAccounts = (keyVaultConfig: any) => {
    const validatorsAccounts = (isDone ? processData : accounts).filter(item => item.network === Connection.db().get('network'));
    const newObject = validatorsAccounts.reduce((prev, curr, index) => {
      const rewardAddress = (keyVaultConfig?.fee_recipients && keyVaultConfig.fee_recipients[curr?.publicKey]) ?? '';
      // eslint-disable-next-line no-param-reassign
      prev[curr?.publicKey] = {...curr, rewardAddress, addressStatus: undefined, index};
      return prev;
    }, {});

    setValidators(newObject);
    onPageClick(0, newObject);
  };

  useEffect(() => {
    verifyAddresses();
  }, [validators]);

  const isAddressVerify = (address: string): boolean => {
    try {
      return web3.utils.isAddress(address);
    } catch {
      return false;
    }
  };

  const verifyAddresses = () => {
    const clonedObj = {};
    Object.keys(validators).forEach((publicKey: string) => {
      clonedObj[publicKey] = validators[publicKey];
      const validatorRewardAddress = clonedObj[publicKey]?.rewardAddress;
      if (validatorRewardAddress?.length === 0) clonedObj[publicKey].addressStatus = undefined;
      else clonedObj[publicKey].addressStatus = isAddressVerify(validatorRewardAddress);
    });
    setAddressesVerified(clonedObj);
  };

  const submitRewardAddresses = async () => {
    if (buttonEnable) {
      setIsLoading(true);
      const problematicValidator = Object.keys(validators).find(address => !validators[address].addressStatus);
      if (problematicValidator) {
        setIsLoading(false);
        if (validators[problematicValidator]?.rewardAddress?.length === 0) {
          showError(`Validator ${validators[problematicValidator]?.index + 1} in the list has not been provided with an address`);
        } else {
          showError(`Validator ${validators[problematicValidator]?.index + 1} in the list has an invalid address`);
        }
        return;
      }

      showError('');
      const keyVaultService = new KeyVaultService();
      let newAddress = Object.keys(validators).reduce((prev: any, curr: string) => {
        // eslint-disable-next-line no-param-reassign
        prev[curr] = validators[curr].rewardAddress;
        return prev;
      }, {});

      if (isDone) newAddress = {...newAddress, ...keyVaultConfigData};

      const assignData = {
        fee_recipients: newAddress,
        network: Connection.db().get('network'),
      };

      if (walletNeedsUpdate) {
        const title = 'Update KeyVault';
        const confirmButtonText = title;
        setModalDisplay({
          show: true,
          type: MODAL_TYPES.UPDATE_KEYVAULT_REQUEST,
          text: 'Please update your KeyVault before adding reward addresses',
          confirmation: {
            title,
            confirmButtonText,
            cancelButtonText: 'Later',
            onConfirmButtonClick: () => {
              checkIfPasswordIsNeeded(async () => {
                setModalDisplay({show: true, type: MODAL_TYPES.UPDATE, data: assignData});
              });
            },
            onCancelButtonClick: () => clearModalDisplayData()
          }
        });
        setIsLoading(false);
        return;
      }

      checkIfPasswordIsNeeded(async () => {
        const goToDeposit = props.pageData.newValidatorDeposited === false || !!props.seedLessNeedDeposit;
        const depositRedirect = selectedSeedMode() ? config.WIZARD_PAGES.VALIDATOR.STAKING_DEPOSIT : config.WIZARD_PAGES.VALIDATOR.DEPOSIT_OVERVIEW;
        const redirectTo = goToDeposit ? depositRedirect : config.WIZARD_PAGES.VALIDATOR.CONGRATULATIONS;
        const walletService = new WalletService();
        await keyVaultService.setListAccountsRewardKeys(assignData);
        await walletService.syncVaultConfigWithBlox();
        if (props.flowPage) await setPage(redirectTo);
        else {
          await loadDataAfterNewAccount();
          goToPage(ROUTES.DASHBOARD);
        }
        setIsLoading(false);
      });
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
      const validator = validators[curr];
      validator.rewardAddress = address;
      // eslint-disable-next-line no-param-reassign
      prev[curr] = validator;
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
      {!props.flowPage && (
        <BackButton onClick={() => {
          loadDataAfterNewAccount().then(() => {
            goToPage(ROUTES.DASHBOARD);
          });
          goToPage(ROUTES.DASHBOARD);
        }} />
      )}
      <Title>Fee Recipient Address</Title>
      <Text style={{marginBottom: 8}}>
        Please enter an Ethereum address in order to receive fee recipient address for each of <br /> your
        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
        &nbsp;validators. <Link onClick={() => openExternalLink('', 'https://bloxstaking.com/blog/product-updates/merge-is-here/')} style={{fontSize: 14, textDecoration: 'underline'}}>What are proposal rewards?</Link>
      </Text>
      <TinyText>
        Please note that standard rewards from performing other duties will remain to be credited to your validator
        balance.
      </TinyText>
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
      {error && <ErrorMessage>{error}</ErrorMessage>}
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

export default connect(mapStateToProps, mapDispatchToProps)(RewardAddresses);
