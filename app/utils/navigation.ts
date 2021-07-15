import config from '~app/backend/common/config';

export const findPageAndStepPath = (where: string, page: number, step: number) => {
  if (where === 'page') {
    if (page === 0) {
      return 'WIZARD.START_PAGE';
    }
    let keys = Object.keys(config.WIZARD_PAGES.WALLET);
    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      if (config.WIZARD_PAGES.WALLET[key] === page) {
        return `WALLET.${key}`;
      }
    }
    keys = Object.keys(config.WIZARD_PAGES.ACCOUNT);
    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      if (config.WIZARD_PAGES.ACCOUNT[key] === page) {
        return `ACCOUNT.${key}`;
      }
    }
    keys = Object.keys(config.WIZARD_PAGES.VALIDATOR);
    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      if (config.WIZARD_PAGES.VALIDATOR[key] === page) {
        return `WALLET.${key}`;
      }
    }
  } else if (where === 'step') {
    const keys = Object.keys(config.WIZARD_STEPS);
    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      if (config.WIZARD_STEPS[key] === step) {
        return `WIZARD_STEPS.${key}`;
      }
    }
  }
  return `UNKNOWN: ${where} (page: ${page}, step: ${step})`;
};
