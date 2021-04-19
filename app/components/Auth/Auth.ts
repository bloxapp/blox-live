import url from 'url';
import { shell } from 'electron';
import EventEmitter from 'events';
import jwtDecode from 'jwt-decode';
import { version } from '~app/package.json';
import analytics from '~app/backend/analytics';
import config from '~app/backend/common/config';
import { getOsVersion } from '~app/utils/service';
import { SOCIAL_APPS } from '~app/common/constants';
import { Log } from '~app/backend/common/logger/logger';
import { createAuthWindow } from '~app/components/Auth/Auth-Window';
import BaseStore from '~app/backend/common/store-manager/base-store';
import Connection from '~app/backend/common/store-manager/connection';
import { createLogoutWindow } from '~app/components/Auth/Logout-Window';
import BloxApi from '~app/backend/common/communication-manager/blox-api';
import AuthApi from '~app/backend/common/communication-manager/auth-api';
import { METHOD } from '~app/backend/common/communication-manager/constants';

export default class Auth {
  idToken: string;
  userProfile: Profile;
  auth: Auth0ConfigObject;
  private readonly authApi: AuthApi;
  private readonly bloxApi: BloxApi;
  private readonly logger: Log;
  private readonly baseStore: BaseStore;
  private static eventEmitter: EventEmitter;
  public static AUTH_EVENTS = {
    LOGIN_BUTTON_CLICKED: 'LOGIN_BUTTON/CLICKED'
  };

  constructor() {
    this.idToken = '';
    this.userProfile = null;
    this.auth = {
      domain: config.env.AUTH0_DOMAIN || '',
      clientID: config.env.AUTH0_CLIENT_ID || '',
      redirectUri: config.env.AUTH0_CALLBACK_URL,
      responseType: 'code',
      scope: 'openid profile email offline_access'
    };
    this.authApi = new AuthApi();
    this.bloxApi = new BloxApi();
    this.logger = new Log(Auth.name);
    this.baseStore = new BaseStore();
  }

  loginWithSocialApp = async (name: string) => {
    return new Promise((resolve, reject) => {
      const onSuccess = async (response: Auth0Response) => {
        if (response.status === 200) {
          const userProfile: Profile = jwtDecode(response.data.id_token);
          await this.setSession(response.data, userProfile);
          resolve({
            idToken: response.data.id_token,
            idTokenPayload: userProfile
          });
        }
        this.logger.error('Login error thru social app');
        reject(new Error('Error in login'));
      };
      const onFailure = () => reject(new Error(''));
      createAuthWindow(this, name, onSuccess, onFailure);
    });
  };

  loginFromBrowser = (name: string) => shell.openExternal(`${config.env.WEB_APP_URL}/auth/?provider=${name}`);

  getAuthenticationURL = (socialAppName: string) => {
    const { domain, clientID, redirectUri, responseType, scope } = this.auth;
    let authUrl = `https://${domain}/`;
    authUrl += `authorize?scope=${scope}&`;
    authUrl += `response_type=${responseType}&`;
    authUrl += `client_id=${clientID}&`;
    authUrl += `connection=${SOCIAL_APPS[socialAppName].connection}&`;
    authUrl += `&redirect_uri=${redirectUri}&`;
    authUrl += 'prompt=login';
    return authUrl;
  };

  loadAuthToken = async (callbackURL: string) => {
    const { clientID, redirectUri } = this.auth;
    const urlParts = url.parse(callbackURL, true);
    const { query } = urlParts;
    const exchangeOptions = {
      grant_type: 'authorization_code',
      client_id: clientID,
      code: query.code,
      redirect_uri: redirectUri
    };

    try {
      return await this.authApi.request('POST', 'token', JSON.stringify(exchangeOptions), null, true);
    } catch (error) {
      await this.logout();
      this.logger.error('Load auth token error');
      return Error(error);
    }
  };

  handleCallBackFromBrowser = async (tokenData) => {
    return new Promise((resolve, reject) => {
      const { idToken, refreshToken } = tokenData;
      const userProfile: Profile = jwtDecode(idToken);
      this.setSession({ id_token: idToken, refresh_token: refreshToken }, userProfile);
      if (idToken && userProfile) {
        resolve({
          ...tokenData,
          idTokenPayload: userProfile
        });
      } else {
        this.logger.error('Error handling callback from browser');
        reject(new Error('Error in login'));
      }
    });
  };

  static get events(): EventEmitter {
    if (!Auth.eventEmitter) {
      Auth.eventEmitter = new EventEmitter();
    }
    return Auth.eventEmitter;
  }

  setSession = async (authResult: Auth0ResponseData, userProfile: Profile) => {
    const { id_token } = authResult;
    this.idToken = id_token;
    this.userProfile = userProfile;
    this.logger.info('Setup user account');
    Connection.setup({
      currentUserId: userProfile.sub,
      tokenData: {
        authToken: authResult.id_token,
        refreshToken: authResult.refresh_token
      }
    });
    await analytics.identify(userProfile.sub, {
      appUuid: this.baseStore.get('appUuid'),
      os: getOsVersion(),
      appVersion: `v${version}`
    });
    // await analytics.track('sign-in', {}); // DONE ON ORG CENTER SIDE
    // await Migrate.runMain(userProfile.sub, Store.getStore().get('env'));
    this.bloxApi.init();
    await this.bloxApi.request(METHOD.GET, 'organizations/profile');
  };

  getIdToken = () => this.idToken;

  getProfile = (cb: CallBack) => cb(this.userProfile, null);

  logout = async () => {
    await createLogoutWindow(`https://${this.auth.domain}/v2/logout?client_id=${this.auth.clientID}&federated`);
    Connection.db().logout();
    this.idToken = '';
    this.userProfile = null;
  };
}

interface Auth0ConfigObject {
  domain: string;
  clientID: string;
  redirectUri: string;
  responseType: string;
  scope: string;
}

interface Auth0Response {
  status: number;
  data: Auth0ResponseData
}

interface Auth0ResponseData {
    id_token: string;
    refresh_token: string;
}

export type Profile = Record<string, any> | null;
type Error = Record<string, any> | null;
type CallBack = (profile: Profile, error?: Error) => void;
