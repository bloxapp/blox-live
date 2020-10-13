import url from 'url';
import jwtDecode from 'jwt-decode';
import { SOCIAL_APPS } from 'common/constants';
import { createAuthWindow } from './Auth-Window';
import { createLogoutWindow } from './Logout-Window';
import Store from 'backend/common/store-manager/store';
import BloxApi from 'backend/common/communication-manager/blox-api';
import AuthApi from 'backend/common/communication-manager/auth-api';
import config from 'backend/common/config';

export default class Auth {
  idToken: string;
  userProfile: Profile;
  auth: Auth0ConfigObject;
  private readonly authApi: AuthApi;

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
  }

  loginWithSocialApp = async (name: string) => {
    return new Promise((resolve, reject) => {
      const onSuccess = (response: Auth0Response) => {
        if (response.status === 200) {
          const userProfile: Profile = jwtDecode(response.data.id_token);
          this.setSession(response.data, userProfile);
          resolve({
            idToken: response.data.id_token,
            idTokenPayload: userProfile
          });
        }
        reject(new Error('Error in login'));
      };
      const onFailure = () => reject(new Error(''));
      createAuthWindow(this, name, onSuccess, onFailure);
    });
  };

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
      return Error(error);
    }
  };

  setSession = async (authResult: Auth0ResponseData, userProfile: Profile) => {
    const { id_token } = authResult;
    this.idToken = id_token;
    this.userProfile = userProfile;
    Store.getStore().init(userProfile.sub, authResult.id_token);
    BloxApi.init();
  };

  getIdToken = () => this.idToken;

  getProfile = (cb: CallBack) => cb(this.userProfile, null);

  logout = async () => {
    await createLogoutWindow(`https://${this.auth.domain}/v2/logout?client_id=${this.auth.clientID}&federated`);
    Store.getStore().logout();
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
