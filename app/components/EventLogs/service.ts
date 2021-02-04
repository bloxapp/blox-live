import moment from 'moment';
import { loadLastConnection } from 'common/service';
import { Log } from '../../backend/common/logger/logger';

export const normalizedActiveValidators = (eventLogs) => {
  const logger = new Log();
  const lastConnection = loadLastConnection();
  logger.debug('user last connection:', lastConnection);
  const activeValidators = eventLogs.filter((eventlog: Record<string, any>) => {
    const isActive = eventlog.type === 'validator_assigned';
    const isBefore = moment(lastConnection).isBefore(eventlog.createdAt);
    return isActive && isBefore;
  });
  return activeValidators;
};
