export const COLOR = {
  POSITIVE: 'accent2400',
  NEUTRAL: 'gray600',
  NEGATIVE: 'destructive700'
};

export const EVENTS = {
  key_vault_inactive: {title: 'KeyVault Inactive', color: COLOR.NEGATIVE, description: 'Blox was unable to communicate with your KeyVault'},
  key_vault_active: {title: 'KeyVault Active', color: COLOR.POSITIVE, description: 'KeyVault became active'},
  validator_assigned: {title: 'Validator Successfully Assigned', color: COLOR.POSITIVE, description: 'Validator {} was successfully assigned'},
  validator_pending: {title: 'Pending Approval', color: COLOR.NEUTRAL, description: 'Validator {} became pending for approval'},
  validator_slashed: {title: 'Validator Slashed', color: COLOR.NEGATIVE, description: 'Validator {} was Slashed due to inactivity'},
  validator_exited: {title: 'Validator Exited', color: COLOR.NEGATIVE, description: 'Validator {} was exited'},
  validator_exiting: {title: 'Validator Exiting', color: COLOR.NEGATIVE, description: 'Validator {} became exiting'},
};
