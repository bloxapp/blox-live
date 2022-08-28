import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useInjectSaga } from 'utils/injectSaga';
import userSaga from '~app/components/User/saga';
import { loadUserInfo } from '~app/components/User/actions';
import passwordSaga from '~app/components/PasswordHandler/saga';
import { savePassword } from '~app/components/PasswordHandler/actions';
import useProcessRunner from '~app/components/ProcessRunner/useProcessRunner';

const passwordKey = 'password';
const userKey = 'user';

type Credentials = {
  accessKeyId: string;
  secretAccessKey: string;
};

const useCreateServer = (props: useCreateServerProps) => {
  useInjectSaga({ key: passwordKey, saga: passwordSaga, mode: '' });
  useInjectSaga({ key: userKey, saga: userSaga, mode: '' });

  const dispatch = useDispatch();
  const { onStart, onSuccess, inputData } = props;
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
      await startProcess(name, 'Checking KeyVault configuration...', { credentials, inputData });
      onStart && onStart();
    }
  };

  return { isLoading, error, processMessage, loaderPercentage, accessKeyId, setAccessKeyId,
           secretAccessKey, setSecretAccessKey, onStartProcessClick, isPasswordInputDisabled, isButtonDisabled };
};

type useCreateServerProps = {
  inputData?: any;
  onStart?: () => void;
  onSuccess?: () => void;
};

export default useCreateServer;
