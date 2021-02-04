import url from 'url';
import jwtDecode from 'jwt-decode';
import { shell } from 'electron';
import { SOCIAL_APPS } from 'common/constants';
import { createAuthWindow } from './Auth-Window';
import { createLogoutWindow } from './Logout-Window';
import Connection from 'backend/common/store-manager/connection';
import BloxApi from 'backend/common/communication-manager/blox-api';
import { METHOD } from 'backend/common/communication-manager/constants';
import AuthApi from 'backend/common/communication-manager/auth-api';
import config from 'backend/common/config';
import { Migrate } from 'backend/migrate';
import { Log } from 'backend/common/logger/logger';

export default class Auth {
  idToken: string;
  userProfile: Profile;
  auth: Auth0ConfigObject;
  private readonly authApi: AuthApi;
  private readonly bloxApi: BloxApi;
  private readonly logger: Log;

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
    this.logger = new Log();
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

  handleCallBackFromBrowser = async (id_token: string) => {
    return new Promise((resolve, reject) => {
      const userProfile: Profile = jwtDecode(id_token);
      this.setSession({ id_token }, userProfile);
      if (id_token && userProfile) {
        resolve({
          idToken: id_token,
          idTokenPayload: userProfile
        });
      }
      else {
        this.logger.error('Error hadle callback from browser');
        reject(new Error('Error in login'));
      }
    });
  };

  setSession = async (authResult: Auth0ResponseData, userProfile: Profile) => {
    const { id_token } = authResult;
    this.idToken = id_token;
    this.userProfile = userProfile;
    this.logger.info('Setup user account');
    Connection.setup({ currentUserId: userProfile.sub, authToken: authResult.id_token });
    // Store.getStore().init(userProfile.sub, authResult.id_token);

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
}

type Profile = Record<string, any> | null;
type Error = Record<string, any> | null;
type CallBack = (profile: Profile, error?: Error) => void;
