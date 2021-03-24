import config from '~app/backend/common/config';

/**
 * Should indicate import validator page in navigation?
 */
const showImportValidatorPage = (props: Record<string, any>): boolean => {
  return [
    config.WIZARD_PAGES.WALLET.IMPORT_MNEMONIC,
    config.WIZARD_PAGES.WALLET.IMPORT_VALIDATORS
  ].indexOf(props.page) !== -1;
};

/**
 * Should indicate create validator page in navigation?
 */
const showCreateValidatorPage = (props: Record<string, any>): boolean => {
  return [
    config.WIZARD_PAGES.WALLET.ENTER_MNEMONIC,
    config.WIZARD_PAGES.VALIDATOR.SELECT_NETWORK,
    config.WIZARD_PAGES.VALIDATOR.CREATE_VALIDATOR,
    config.WIZARD_PAGES.VALIDATOR.STAKING_DEPOSIT
  ].indexOf(props.page) !== -1;
};

const navigationRules = [
  {
    name: 'KeyVault Setup',
    step: config.WIZARD_STEPS.KEY_VAULT_SETUP,
    show: (props: Record<string, any>): boolean => {
      if (props.pageData?.finishValidatorSetup) {
        return false;
      }
      if (props.accounts?.length === 1) {
        return [
          config.WIZARD_PAGES.VALIDATOR.CONGRATULATIONS,
          config.WIZARD_PAGES.VALIDATOR.STAKING_DEPOSIT
        ].indexOf(props.page) !== -1;
      }
      return !props.accounts?.length;
    },
    done: (props: Record<string, any>): boolean => {
      return props.step !== config.WIZARD_STEPS.KEY_VAULT_SETUP;
    },
    active: (props: Record<string, any>): boolean => {
      return props.step === config.WIZARD_STEPS.KEY_VAULT_SETUP;
    },
    hideNumber: (): boolean => false,

    pages: [
      {
        name: 'Select Cloud Provider',
        page: config.WIZARD_PAGES.WALLET.SELECT_CLOUD_PROVIDER,
        done: (props: Record<string, any>): boolean => {
          return props.page > config.WIZARD_PAGES.WALLET.SELECT_CLOUD_PROVIDER;
        },
        show: (): boolean => true
      },
      {
        name: 'Create KeyVault',
        page: config.WIZARD_PAGES.WALLET.CREATE_SERVER,
        done: (props: Record<string, any>): boolean => {
          return props.page > config.WIZARD_PAGES.WALLET.CREATE_SERVER;
        },
        show: (): boolean => true
      }
    ],
    separator: true
  },
  {
    name: 'Validator Setup',
    step: config.WIZARD_STEPS.VALIDATOR_SETUP,
    show: () => true,
    done: (props: Record<string, any>): boolean => {
      if (props.pageData?.newValidatorDeposited) {
        return true;
      }
      return props.page === config.WIZARD_PAGES.VALIDATOR.CONGRATULATIONS;
    },
    active: (props: Record<string, any>): boolean => {
      return props.step === config.WIZARD_STEPS.VALIDATOR_SETUP;
    },
    hideNumber: (props: Record<string, any>): boolean => {
      if (props.pageData?.finishValidatorSetup) {
        return true;
      }
      if (props.accounts?.length) {
        return true;
      }
      return props.addAdditionalAccount;
    },
    pages: [
      {
        name: 'Import/Create Seed',
        page: config.WIZARD_PAGES.WALLET.IMPORT_OR_GENERATE_SEED,
        done: (props: Record<string, any>): boolean => {
          return props.page > config.WIZARD_PAGES.WALLET.IMPORT_OR_GENERATE_SEED;
        },
        show: (props: Record<string, any>): boolean => {
          if (props.accounts?.length === 1) {
            return props.page === config.WIZARD_PAGES.VALIDATOR.STAKING_DEPOSIT;
          }
          if (props.addAdditionalAccount) {
            return false;
          }
          if (props.pageData?.finishValidatorSetup) {
            return false;
          }
          if (props.page === config.WIZARD_PAGES.VALIDATOR.STAKING_DEPOSIT) {
            return false;
          }
          return props.step === config.WIZARD_STEPS.VALIDATOR_SETUP;
        }
      },
      {
        name: 'Generate Seed',
        page: config.WIZARD_PAGES.WALLET.ENTER_MNEMONIC,
        done: (props: Record<string, any>): boolean => {
          return props.page > config.WIZARD_PAGES.WALLET.ENTER_MNEMONIC;
        },
        show: (props: Record<string, any>): boolean => {
          if (props.pageData?.finishValidatorSetup) {
            return false;
          }
          if (props.addAdditionalAccount) {
            return false;
          }
          if (props.accounts?.length) {
            return false;
          }
          return showCreateValidatorPage(props);
        },
      },
      {
        name: 'Select Staking Network',
        page: config.WIZARD_PAGES.VALIDATOR.SELECT_NETWORK,
        done: (props: Record<string, any>): boolean => {
          return props.page > config.WIZARD_PAGES.VALIDATOR.SELECT_NETWORK;
        },
        show: showCreateValidatorPage
      },
      {
        name: 'Generate Keys',
        page: config.WIZARD_PAGES.VALIDATOR.CREATE_VALIDATOR,
        done: (props: Record<string, any>): boolean => {
          return props.page > config.WIZARD_PAGES.VALIDATOR.CREATE_VALIDATOR;
        },
        show: showCreateValidatorPage
      },
      {
        name: 'Staking Deposit',
        page: config.WIZARD_PAGES.VALIDATOR.STAKING_DEPOSIT,
        done: (props: Record<string, any>): boolean => {
          return props.page > config.WIZARD_PAGES.VALIDATOR.STAKING_DEPOSIT;
        },
        show: (props: Record<string, any>) => {
          if (props.pageData?.newValidatorDeposited) {
            return false;
          }
          return showCreateValidatorPage(props);
        }
      },
      {
        name: 'Import Seed',
        page: config.WIZARD_PAGES.WALLET.IMPORT_MNEMONIC,
        done: (props: Record<string, any>): boolean => {
          return props.page > config.WIZARD_PAGES.WALLET.IMPORT_MNEMONIC;
        },
        show: showImportValidatorPage
      },
      {
        name: 'Validator Selection',
        page: config.WIZARD_PAGES.WALLET.IMPORT_VALIDATORS,
        done: (props: Record<string, any>): boolean => {
          return props.page > config.WIZARD_PAGES.WALLET.IMPORT_VALIDATORS;
        },
        show: showImportValidatorPage
      },
    ]
  }
];

export default navigationRules;
