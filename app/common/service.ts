import moment from 'moment';
import { app, remote, shell } from 'electron';
import config from '~app/backend/common/config';
import { Log } from '~app/backend/common/logger/logger';
import Connection from '~app/backend/common/store-manager/connection';

const logger = new Log();

/**
 * Returns string representation of selected validators mode: "seed" or "keystore".
 */
export const getSelectedValidatorMode = () => {
  return Connection.db().get(config.FLAGS.VALIDATORS_MODE.KEY);
};

/**
 * Returns true if user selected keystore mode during setup.
 */
export const selectedKeystoreMode = () => {
  return getSelectedValidatorMode() === config.FLAGS.VALIDATORS_MODE.KEYSTORE;
};

/**
 * Returns true if user selected seed moe during setup.
 */
export const selectedSeedMode = () => {
  return getSelectedValidatorMode() === config.FLAGS.VALIDATORS_MODE.SEED || !selectedKeystoreMode();
};

export const saveLastConnection = () => {
  const now = moment().utc();
  Connection.db().set('lastConnection', now);
  logger.debug(`App Saved Connection Time: ${now}`);
};

export const loadLastConnection = () => {
  return Connection.db().get('lastConnection');
};

export const onWindowClose = () => {
  window.addEventListener('beforeunload', () => {
    saveLastConnection();
  });
};

export const openLocalDirectory = (directory: string) => {
  const dataPath = (app || remote.app).getPath('userData');
  shell.openExternal(`file:///${dataPath}/${directory}`);
};
