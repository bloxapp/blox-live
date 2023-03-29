import { useEffect } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import saga from './saga';
import * as selectors from './selectors';
import { useInjectSaga } from 'utils/injectSaga';
import { loadAccounts, setFilteredAccounts, setAccountsSummary } from './actions';

const {
  getAccounts,
  getAccountsError,
  getAccountsSummary,
  getFilteredAccounts,
  getAccountsLoadingStatus,
} = selectors;

const useAccounts = () => {
  useInjectSaga({key: 'accounts', saga, mode: ''});

  const dispatch = useDispatch();
  const accounts: [] = useSelector(getAccounts, shallowEqual);
  const accountsError: string = useSelector(getAccountsError);
  const accountsSummary: any = useSelector(getAccountsSummary);
  const filteredAccounts: any = useSelector(getFilteredAccounts, shallowEqual);
  const isLoadingAccounts: boolean = useSelector(getAccountsLoadingStatus);

  useEffect(() => {
    if (!accounts && !isLoadingAccounts && !accountsError) {
      dispatch(loadAccounts());
    }
  }, [isLoadingAccounts, accounts, accountsError]);

  return {
    isLoadingAccounts,
    accounts,
    accountsError,
    filteredAccounts,
    accountsSummary,
    setFilteredAccounts,
    setAccountsSummary,
  };
};

export default useAccounts;
