import moment from 'moment';
import EventEmitter from 'events';
import jwtDecode from 'jwt-decode';
import axiosRetry from 'axios-retry';
import axios, { AxiosError } from 'axios';
import { Catch } from '~app/backend/decorators';
import config from '~app/backend/common/config';
import { Log } from '~app/backend/common/logger/logger';
import BaseStore from '~app/backend/common/store-manager/base-store';
import Connection from '~app/backend/common/store-manager/connection';
import { MakeQueryablePromise, checkJwtStructure } from '~app/utils/request';

type JWTProfile = Record<string, any>;

// Persistent container for refresh token promise
const RefreshingToken = {
  promise: null
};

type RefreshedAuthData = {
  id_token: string,
  refresh_token: string
};

export default class Http {
  baseStore: BaseStore;
  protected notAuthRequest: boolean = false;
  protected storePrefix: string = '';
  baseUrl?: string;
  protected instance: any;
  protected logger: Log;
  public static EVENTS = {
    NEW_ACCESS_TOKEN: 'NEW_ACCESS_TOKEN',
    INVALID_TOKEN: 'INVALID_TOKEN'
  };
  private static eventEmitter: EventEmitter;

  constructor() {
    this.logger = new Log('http');
    this.instance = axios.create();
    this.baseStore = new BaseStore();
    this.initRetryHandler();
  }

  public static get EventEmitter() {
    if (!Http.eventEmitter) {
      Http.eventEmitter = new EventEmitter();
    }
    return Http.eventEmitter;
  }

  /**
   * Retry in all cases except unauthorized status
   */
  private initRetryHandler() {
    axiosRetry(this.instance, {
      retries: +config.env.HTTP_RETRIES,
      retryDelay: (retryCount) => {
        return retryCount * +config.env.HTTP_RETRY_DELAY;
      },
      // Dont repeat forbidden requests
      retryCondition: (error: AxiosError) => {
        return error.response?.status !== 401;
      }
    });
  }

  /**
   * Wait for promise with fresh bearer token
   */
  protected async getAuthHeader(): Promise<RefreshedAuthData> {
    if (RefreshingToken.promise) {
      if (!RefreshingToken.promise.isFulfilled() && !RefreshingToken.promise.isRejected()) {
        return RefreshingToken.promise;
      }
      if (RefreshingToken.promise.isFulfilled() || RefreshingToken.promise.isRejected()) {
        RefreshingToken.promise = null;
      }
    }

    let authToken = Connection.db(this.storePrefix).get('authToken');
    const refreshToken = Connection.db(this.storePrefix).get('refreshToken');
    if (authToken) {
      // Check header
      let jwtError = false;
      let currentDateTime;
      let expirationDateTime;
      let isAccessTokenExpired = false;

      try {
        // Check basic structure
        if (checkJwtStructure(authToken) === null) {
          throw new Error('JWT Structure is invalid!');
        }

        const userProfile: JWTProfile = jwtDecode(authToken);
        currentDateTime = moment().add(-10, 'minutes');
        expirationDateTime = moment.unix(userProfile.exp);
        isAccessTokenExpired = expirationDateTime.isBefore(currentDateTime);
        if (this.baseStore.get(config.FLAGS.AUTH.TEST_EXPIRED_ACCESS_TOKEN)) {
          isAccessTokenExpired = true;
          this.baseStore.set(config.FLAGS.AUTH.TEST_EXPIRED_ACCESS_TOKEN, false);
        }
      } catch (error) {
        this.logger.error('JWT Error: ', error);
        jwtError = error;
      }

      if (refreshToken && !jwtError && isAccessTokenExpired) {
        this.logger.info(`⌛ Current time: ${currentDateTime.format('LLL')}`);
        this.logger.info(`⌛ Access token exp. time: ${expirationDateTime.format('LLL')}`);
        this.logger.info('🔄 Requesting new access token..');

        // eslint-disable-next-line no-async-promise-executor
        RefreshingToken.promise = MakeQueryablePromise(new Promise(async (resolve) => {
          try {
            const newTokenResponse = await axios.get(`${config.env.REFRESH_TOKEN_URL}/${refreshToken}`);
            authToken = newTokenResponse.data?.id_token;
            // Pro-actively saving this in the store for further requests
            // without waiting for new access token event dispatcher to finish their job
            if (authToken) {
              this.baseStore.set('authToken', authToken);
              this.baseStore.set('refreshToken', refreshToken);
              const refreshedAuthData = { token_id: authToken, refresh_token: refreshToken };
              Http.EventEmitter.emit(Http.EVENTS.NEW_ACCESS_TOKEN, refreshedAuthData);
            } else {
              // Show login screen if access token is not renewed.
              // The only way here is re-login
              Http.EventEmitter.emit(Http.EVENTS.INVALID_TOKEN);
            }
          } catch (refreshTokenError) {
            this.logger.error('Refresh token error:', refreshTokenError);
            Http.EventEmitter.emit(Http.EVENTS.INVALID_TOKEN);
          }
          resolve({ id_token: authToken, refresh_token: refreshToken });
        }));
        return RefreshingToken.promise;
      }
      if (!refreshToken || jwtError) {
        // Show login screen if access or refresh token is corrupted
        Http.EventEmitter.emit(Http.EVENTS.INVALID_TOKEN);
      }
    }
    return { id_token: authToken, refresh_token: refreshToken };
  }

  /**
   * Before every single request which is with authorization - setup auth header
   */
  protected async setupAuthHeader() {
    if (!this.notAuthRequest) {
      const authData: RefreshedAuthData = await this.getAuthHeader();
      this.instance.defaults.headers.common.Authorization = `Bearer ${authData.id_token}`;
    }
  }

  @Catch()
  async request(method: string, url: string, data: any = null, headers: any = null, fullResponse: boolean = false): Promise<any> {
    try {
      await this.setupAuthHeader();
      const response = await this.instance({
        url,
        method,
        data,
        headers: {
          ...this.instance.defaults.headers.common,
          ...headers
        }
      });
      return fullResponse ? response : response.data;
    } catch (error) {
      error.config = {
        url: error.config?.url || url,
        method: error.config?.method || method,
        baseURL: error.config?.baseURL || ''
      };
      delete error.response?.config;
      this.logger.error(error);
      throw error;
    }
  }
}
