import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useInjectSaga } from 'utils/injectSaga';

import passwordSaga from 'components/PasswordHandler/saga';
import { savePassword } from 'components/PasswordHandler/actions';
import useProcessRunner from 'components/ProcessRunner/useProcessRunner';

import userSaga from 'components/User/saga';
import { loadUserInfo } from 'components/User/actions';

const passwordKey = 'password';
const userKey = 'user';

const useCreateServer = ({onStart, onSuccess}: Props) => {
  useInjectSaga({ key: passwordKey, saga: passwordSaga, mode: '' });
  useInjectSaga({ key: userKey, saga: userSaga, mode: '' });
  const dispatch = useDispatch();

  const { isLoading, isDone, error, processName, processMessage,
          startProcess, clearProcessState, loaderPercentage } = useProcessRunner();

  const [accessKeyId, setAccessKeyId] = useState('');
  const [secretAccessKey, setSecretAccessKey] = useState('');
  const isButtonDisabled = !accessKeyId || !secretAccessKey || isLoading || (isDone && !error);
  const isPasswordInputDisabled = isLoading;

  useEffect(() => {
    if (!isLoading && isDone && !error) {
      dispatch(loadUserInfo());
      clearProcessState();
      onSuccess && onSuccess();
    }
  }, [isLoading, isDone, error]);

  const onStartProcessClick = async (name: string) => {
    if (!isButtonDisabled && !processMessage && !processName) {
      name === 'install' && dispatch(savePassword('temp'));
      const credentials: Credentials = { accessKeyId, secretAccessKey };
      await startProcess(name, 'Checking KeyVault configuration...', credentials);
      onStart && onStart();
    }
  };

  return { isLoading, error, processMessage, loaderPercentage, accessKeyId, setAccessKeyId,
           secretAccessKey, setSecretAccessKey, onStartProcessClick, isPasswordInputDisabled, isButtonDisabled };
};

type Props = {
  onStart?: () => void;
  onSuccess?: () => void;
};

type Credentials = {
  accessKeyId: string;
  secretAccessKey: string;
};

export default useCreateServer;
