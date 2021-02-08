import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { getNetwork } from '../../../selectors';
import { loadDepositData } from '../../../actions';
import { GenerateKeys, KeysGenerated } from './components';
import { setDepositNeeded } from '../../../../Accounts/actions';
import useProcessRunner from 'components/ProcessRunner/useProcessRunner';
import usePasswordHandler from '../../../../PasswordHandler/usePasswordHandler';

const CreateValidator = (props: Props) => {
  const { isLoading, isDone, processData, error, startProcess, clearProcessState } = useProcessRunner();
  const { checkIfPasswordIsNeeded } = usePasswordHandler();
  const { page, setPage, callLoadDepositData, callSetDepositNeeded, selectedNetwork } = props;
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
        startProcess('createAccount', 'Generating Validator Keys...', null);
      }
    };
    checkIfPasswordIsNeeded(onSuccess);
  };

  const onContinueClick = () => {
    const { publicKey, network } = account;
    const accountIndex = +account.name.replace('account-', '');
    callSetDepositNeeded({isNeeded: true, publicKey, accountIndex, network});
    setPage(page + 1);
  };

  return (
    <>
      {account && !error ? (
        <KeysGenerated onClick={onContinueClick} validatorData={account} />
      ) : (
        <GenerateKeys network={selectedNetwork} onClick={onGenerateKeysClick} isLoading={isLoading} error={error} />
      )}
    </>
  );
};

const mapStateToProps = (state: State) => ({
  selectedNetwork: getNetwork(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  callLoadDepositData: (publicKey, accountIndex, network) => dispatch(loadDepositData(publicKey, accountIndex, network)),
  callSetDepositNeeded: (payload: DepositNeededPayload) => dispatch(setDepositNeeded(payload)),
});

type Props = {
  page: number;
  network: string;
  setPage: (page: number) => void;
  step: number;
  setStep: (page: number) => void;
  processData?: Record<string, any> | null;
  callLoadDepositData: (publicKey: string, accountIndex: number, network: string) => void;
  callSetDepositNeeded: (payload: DepositNeededPayload) => void;
  selectedNetwork: string;
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
