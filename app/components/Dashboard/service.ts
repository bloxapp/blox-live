import moment from 'moment';

const handleChange = (currentBalance, effectiveBalance) => {
  if (currentBalance && effectiveBalance) {
    return `${currentBalance - effectiveBalance}`;
  }
  return null;
};

export const normalizeAccountsData = (accounts) => {
  return accounts.map((account) => {
    const {
      id,
      publicKey,
      activationTime,
      createdAt,
      currentBalance,
      effectiveBalance,
      status,
    } = account;
    const newAccount = { ...account };

    newAccount.key = {
      publicKey,
      activationTime,
      createdAt: moment(createdAt).format('MMMM DD, YYYY'),
      status
    };

    newAccount.change = handleChange(currentBalance, effectiveBalance);
    delete newAccount.publicKey;
    delete newAccount.activationTime;
    delete newAccount.date;

    newAccount.misc = {
      accountId: id,
      wallet: '',
    };
    return newAccount;
  });
};

export const summarizeAccounts = (accounts) => {
  const initialObject = {
    balance: 0.0,
    change: 0.0,
    totalChange: 0.0,
    sinceStart: 0.0,
  };
  const summary = accounts.reduce((accumulator, value, index) => {
    const { effectiveBalance, currentBalance } = value;
    if (Number.isNaN(effectiveBalance) || Number.isNaN(currentBalance)) {
      return 'N/A';
    }
    const difference = parseFloat(currentBalance) - parseFloat(effectiveBalance);
    const precentage = (difference / parseFloat(effectiveBalance)) * 100;
    const totalChange = accumulator.totalChange + precentage;

    return {
      balance: accumulator.balance + parseFloat(currentBalance),
      totalChange,
      change: index + 1 === accounts.length ? totalChange / accounts.length : 0,
      sinceStart: accumulator.sinceStart + parseFloat(effectiveBalance),
    };
  }, initialObject);

  const withFixedNumbers = fixNumOfDigits(summary);
  return withFixedNumbers;
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

export const normalizeEventLogs = (events) => {
  const normalizedEvents = events.map((event) => {
    const {
      createdAt,
      orgId,
      publicKey,
      type,
    } = event;
    const newEvent = { ...event };

    newEvent.createdAt = moment(createdAt).format('MMMM DD, YYYY');
    newEvent.description = {
      type,
      orgId,
      publicKey: publicKey !== null ? publicKey : '',
    };
    return newEvent;
  });

  normalizedEvents.sort((a, b) => {
    return a.createdAt - b.createdAt ? 1 : -1;
  });
  return normalizedEvents;
};
