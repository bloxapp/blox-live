import { useSelector, useDispatch, shallowEqual } from 'react-redux';

import saga from './saga';
import * as selectors from './selectors';
import { useInjectSaga } from 'utils/injectSaga';
import { precentageCalculator } from 'utils/service';
import { processSubscribe, processClearState, ProcessParams } from './actions';

const {
  getName, getMessage, getIsLoading, getIsDone, getIsServerActive,
  getOverallSteps, getCurrentStep, getError, getData
} = selectors;

const useProcessRunner = () => {
  useInjectSaga({key: 'processRunner', saga, mode: ''});
  const dispatch = useDispatch();

  const props: Props = {
    processName: useSelector(getName, shallowEqual),
    processMessage: useSelector(getMessage, shallowEqual),
    isLoading: useSelector(getIsLoading, shallowEqual),
    isDone: useSelector(getIsDone, shallowEqual),
    isServerActive: useSelector(getIsServerActive, shallowEqual),
    processData: useSelector(getData, shallowEqual),
    error: useSelector(getError, shallowEqual)
  };

  const steps: Steps = {
    overallSteps: useSelector(getOverallSteps, shallowEqual),
    currentStep: useSelector(getCurrentStep, shallowEqual),
  };
  const loaderPercentage = precentageCalculator(steps.currentStep, steps.overallSteps);

  const startProcess: StartProcess = async (name, defaultMessage, params?: ProcessParams) => {
    return dispatch(processSubscribe(name, defaultMessage, params));
  };

  const clearProcessState: ClearProcess = () => dispatch(processClearState());

  return { ...props, loaderPercentage, startProcess, clearProcessState };
};

type Steps = {
  overallSteps: number;
  currentStep: number;
};

type Props = {
  processName: string;
  processMessage: string;
  isLoading: boolean;
  isDone: boolean;
  isServerActive: boolean;
  processData: Record<string, any>;
  error: string;
};
type StartProcess = (name: string, defaultMessage: string, params?: ProcessParams) => void;
type ClearProcess = () => void;

export default useProcessRunner;
