import { Catch, Step } from '~app/backend/decorators';
import { Log } from '~app/backend/common/logger/logger';
import Store from '~app/backend/common/store-manager/store';

const instances = {};

type TokenData = { authToken: string, refreshToken: string };

export default class Connection {
  private static userId: string;

  static setup(payload: { currentUserId: string, tokenData: TokenData, prefix?: string }): void {
    Connection.userId = payload.currentUserId;
    const name = `${payload.currentUserId}${payload.prefix || ''}`;
    instances[name] = new Store(payload.prefix);
    Connection.init(payload);
  }

  /**
   * Re-initialize with new auth token and user id without re-creating store
   */
  static init(payload: { currentUserId: string, tokenData: TokenData, prefix?: string }) {
    const { authToken, refreshToken } = payload.tokenData;
    const name = `${payload.currentUserId}${payload.prefix || ''}`;
    instances[name].init(payload.currentUserId, { authToken, refreshToken });
  }

  static db(prefix: string = ''): Store {
    const logger = new Log('store');
    const name = `${Connection.userId}${prefix}`;
    if (!instances[name]) {
      const error = new Error('There is no active store connection');
      logger.error(error);
      throw error;
    }
    return instances[name];
  }

  static cloneCryptoKey(payload: { fromPrefix: string, toPrefix: string }): void {
    Connection.db(payload.toPrefix).cryptoKey = Connection.db(payload.fromPrefix).cryptoKey;
  }

  @Step({
    name: 'Clone configuration settings...'
  })
  @Catch({
    showErrorMessage: true
  })
  static clone(payload: {
    fromPrefix: string,
    toPrefix: string,
    fields: any,
    preClean?: boolean,
    postClean?: {
      prefix: string,
      fields?: any
    }
  }): void {
    const logger = new Log('store');
    const items = Connection.db(payload.fromPrefix).all();
    const { preClean, postClean } = payload;
    if (preClean) {
      Connection.db(payload.toPrefix).clear();
    }
    const data = payload.fields.reduce((aggr, field) => {
      // eslint-disable-next-line no-param-reassign
      aggr[field] = items[field];
      return aggr;
    }, {});
    logger.debug('Going to set multiple store values');
    Connection.db(payload.toPrefix).setMultiple(data);
    logger.debug('Set multiple store values result', Connection.db(payload.toPrefix).all());
    if (postClean) {
      if (postClean.fields) {
        postClean.fields.forEach(field => Connection.db(postClean.prefix).delete(field));
      } else {
        Connection.db(postClean.prefix).clear();
      }
    }
  }

  static info(prefix: string = ''): any {
    const name = `${Connection.userId}${prefix}`;
    return {
      userId: Connection.userId,
      connect: instances[name]
     };
  }

  static close(prefix: string = ''): void {
    const name = `${Connection.userId}${prefix}`;
    delete instances[name];
    Connection.userId = null;
  }

  @Step({
    name: 'Clear temporary configuration file...'
  })
  static clear(payload: { prefix: string }): void {
    Connection.db(payload.prefix).clear();
  }

  @Step({
    name: 'Remove configuration file...'
  })
  static remove(payload: { prefix: string }): void {
    Connection.db(payload.prefix).remove();
  }
}
