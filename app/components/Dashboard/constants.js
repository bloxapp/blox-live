export const STATUSES = {
  active: { name: 'Active', color: 'accent2400' },
  waiting: { name: 'Waiting', color: 'warning700' },
  pending: { name: 'Pending', color: 'warning900' },
  exited: { name: 'Exited', color: 'gray400' },
  invalid: { name: 'Invalid', color: 'gray400' },
  slashing: { name: 'Slashed', color: 'destructive600' },
  disabled: { name: 'Disabled', color: 'destructive600' },
  unknown_status: { name: 'Unknown', color: 'destructive600' },
  test_mode: { name: 'Unknown', color: 'destructive600' },
  partially_deposited: { name: 'Partial', color: 'warning900' },
};

export const MODAL_TYPES = {
  REACTIVATION: 'reactivation',
  UPDATE: 'update',
  DEPOSIT_INFO: 'depositInfo',
  FINISH_SETUP: 'finishSetup',
  ADD_VALIDATOR: 'addValidator',
  ACTIVE_VALIDATOR: 'activeValidator',
};
