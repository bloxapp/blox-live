import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import config from '~app/backend/common/config';
import { getNetwork } from '~app/components/Wizard/selectors';
import { loadDepositData } from '~app/components/Wizard/actions';
import * as wizardSelectors from '~app/components/Wizard/selectors';
import Connection from '~app/backend/common/store-manager/connection';
import useDashboardData from '~app/components/Dashboard/useDashboardData';
import useProcessRunner from '~app/components/ProcessRunner/useProcessRunner';
import usePasswordHandler from '~app/components/PasswordHandler/usePasswordHandler';
import { setDepositNeeded, setAddAnotherAccount } from '~app/components/Accounts/actions';
import { GenerateKeys, KeysGenerated } from '~app/components/Wizard/components/Validators/CreateValidator/components';

const CreateValidator = (props: Props) => {
  const { isLoading, isDone, processData, error, startProcess, clearProcessState } = useProcessRunner();
  const { checkIfPasswordIsNeeded } = usePasswordHandler();
  const { loadDataAfterNewAccount } = useDashboardData();
  const { setPage, callLoadDepositData, callSetAddAnotherAccount,
    callSetDepositNeeded, selectedNetwork, depositData, setPageData } = props;
  const account = processData && processData.length ? processData[0] : processData;

  useEffect(() => {
    if (isDone && account && !error) {
      const accountIndex = +account.name.replace('account-', '');
      callLoadDepositData(account.publicKey, accountIndex, account.network);
    }
  }, [isLoading, account, error]);

  const onGenerateKeysClick = () => {
    const onSuccess = () => {
      if (error) {
        clearProcessState();
      }
      if (!isLoading) {
        startProcess('createAccount', 'Generating Validator Keys...', {
          inputData: Connection.db('').get('seed')
        });
      }
    };
    checkIfPasswordIsNeeded(onSuccess);
  };

  const onContinueClick = async () => {
    const { publicKey, network } = account;
    const accountIndex = +account.name.replace('account-', '');
    // Load fresh accounts before WizardStartPage logic will start working
    await loadDataAfterNewAccount().then(async () => {
      await callSetAddAnotherAccount(false);
      await callSetDepositNeeded({
        isNeeded: true,
        publicKey,
        accountIndex,
        network
      });
      await setPage(config.WIZARD_PAGES.VALIDATOR.STAKING_DEPOSIT);
    });
  };

  return (
    <>
      {account && !error && depositData ? (
        <KeysGenerated setPageData={setPageData} depositData={depositData} onClick={onContinueClick} validatorData={account} />
      ) : (
        <GenerateKeys network={selectedNetwork} onClick={onGenerateKeysClick} isLoading={isLoading} error={error} />
      )}
    </>
  );
};

const mapStateToProps = (state: State) => ({
  selectedNetwork: getNetwork(state),
  depositData: wizardSelectors.getDepositData(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  callLoadDepositData: (publicKey, accountIndex, network) => dispatch(loadDepositData(publicKey, accountIndex, network)),
  callSetDepositNeeded: (payload: DepositNeededPayload) => dispatch(setDepositNeeded(payload)),
  callSetAddAnotherAccount: (payload: boolean) => dispatch(setAddAnotherAccount(payload)),
});

type Props = {
  page: number;
  network: string;
  setPage: (page: number) => void;
  setPageData: (data: any) => void;
  step: number;
  setStep: (page: number) => void;
  processData?: Record<string, any> | null;
  callLoadDepositData: (publicKey: string, accountIndex: number, network: string) => void;
  callSetDepositNeeded: (payload: DepositNeededPayload) => void;
  callSetAddAnotherAccount: (payload: boolean) => void;
  selectedNetwork: string;
  depositData: any;
};

type DepositNeededPayload = {
  isNeeded: boolean;
  publicKey: string;
  accountIndex: number;
  network: string;
};

type State = Record<string, any>;
type Dispatch = (arg0: { type: string }) => any;

export default connect(mapStateToProps, mapDispatchToProps)(CreateValidator);
