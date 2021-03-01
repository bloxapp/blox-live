import moment from 'moment';
import config from '~app/backend/common/config';

const initialBalance = config.env.ETH_INITIAL_BALANCE;

const handleChange = (currentBalance) => {
  if (currentBalance && initialBalance) {
    return `${currentBalance - initialBalance}`;
  }
  return null;
};

export const normalizeAccountsData = (accounts) => {
  return accounts.map((account) => {
    const {
      publicKey,
      activationTime,
      createdAt,
      currentBalance,
      status,
      name,
      network
    } = account;
    const newAccount = { ...account };
    newAccount.key = {
      publicKey,
      activationTime,
      createdAt: moment(createdAt).format('MMMM DD, YYYY'),
      status,
      accountIndex: +name.replace('account-', ''),
      network
    };

    newAccount.change = handleChange(currentBalance);
    delete newAccount.activationTime;
    delete newAccount.date;

    return newAccount;
  });
};

export const summarizeAccounts = (accounts) => {
  const initialObject = {
    balance: 0.0,
    sinceStart: 0.0,
    totalChange: 0.0,
  };

  const activeAccounts = accounts.filter((account) => {
    const { effectiveBalance, currentBalance } = account;
    return !(Number.isNaN(parseFloat(effectiveBalance)) || Number.isNaN(parseFloat(currentBalance)));
  });

  if (!activeAccounts.length) {
    return initialObject;
  }

  const totalDeposited = initialBalance * activeAccounts.length;

  const balance = activeAccounts.reduce((aggregate, activeAccount) => {
      return aggregate + parseFloat(activeAccount.currentBalance);
    },
    0.0);

  const summary = {
    balance,
    sinceStart: balance - totalDeposited,
    totalChange: ((balance - totalDeposited) / totalDeposited) * 100.0
  };

  return fixNumOfDigits(summary);
};

const fixNumOfDigits = (summary) => {
  const newObject = {};
  // eslint-disable-next-line no-restricted-syntax
  for (const [key, value] of Object.entries(summary)) {
    if (Number.isNaN(value)) { return null; }
    // @ts-ignore
    newObject[key] = value.toFixed(2);
  }
  return newObject;
};

export const normalizeEventLogs = (events) => { // TODO: fix and move to EventLogs component
  const normalizedEvents = events.map((event) => {
    const { orgId, publicKey, type } = event;
    const newEvent = { ...event };
    newEvent.description = { type, orgId, publicKey: publicKey !== null ? publicKey : '' };
    return newEvent;
  });

  normalizedEvents.sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  return normalizedEvents;
};

/**
 * Returns true if there is more than one different networks in accounts
 */
export const accountsHaveMoreThanOneNetwork = (accounts: { network: string }[]) => {
  if (!accounts?.length) {
    return false;
  }
  const existingNetworks = accounts.reduce((existingNetworksAccumulator, account) => {
    if (existingNetworksAccumulator.indexOf(account.network) === -1) {
      existingNetworksAccumulator.push(account.network);
    }
    return existingNetworksAccumulator;
  }, []);
  return existingNetworks.length > 1;
};
