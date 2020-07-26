import keytar from 'keytar';
import os from 'os';
import url from 'url';
import jwtDecode from 'jwt-decode';
import axios, { AxiosRequestConfig } from 'axios';

import { SOCIAL_APPS } from '../../common/constants';
import { createAuthWindow } from './Auth-Window';
import {
  onAxiosInterceptorSuccess,
  onAxiosInterceptorFailure,
} from './service';

export default class Auth {
  tokens: Record<string, any>;
  userProfile: Record<string, any> | null;
  auth: Record<string, any>;
  keytar: Record<string, any>;

  constructor() {
    this.tokens = {
      accessToken: '',
      idToken: '',
      refreshToken: '',
    };
    this.userProfile = null;
    this.auth = {
      domain: process.env.AUTH0_DOMAIN || '',
      clientID: process.env.AUTH0_CLIENT_ID || '',
      redirectUri: process.env.AUTH0_CALLBACK_URL,
      responseType: 'code',
      scope: 'openid profile email offline_access',
    };
    this.keytar = {
      service: 'electron-openid-oauth',
      account: os.userInfo().username,
    };
  }

  loginWithSocialApp = async (name: string) => {
    return new Promise((resolve, reject) => {
      const callBack = (response) => {
        if (response.status === 200) {
          const userProfile = jwtDecode(response.data.id_token);
          this.setSession(response.data, userProfile);
          this.interceptIdToken(response.data.id_token);
          resolve({
            idToken: response.data.id_token,
            idTokenPayload: userProfile,
          });
        }
        reject(new Error('Error in login'));
      };
      createAuthWindow(this, name, callBack);
    });
  };

  checkIfTokensExist = async () => {
    return new Promise((resolve, reject) => {
      const callBack = (response) => {
        if (response.status === 200) {
          const userProfile = jwtDecode(response.data.id_token);
          this.setSession(response.data, userProfile);
          this.interceptIdToken(response.data.id_token);
          resolve({
            idToken: response.data.id_token,
            idTokenPayload: userProfile,
          });
        }
        reject(new Error(response));
      };
      this.refreshTokens(callBack);
    });
  };

  getAuthenticationURL = (socialAppName) => {
    const { domain, clientID, redirectUri, responseType, scope } = this.auth;
    const authUrl = `https://${domain}/authorize?scope=${scope}&response_type=${responseType}&client_id=${clientID}&connection=${SOCIAL_APPS[socialAppName].connection}&redirect_uri=${redirectUri}`;
    return authUrl;
  };

  refreshTokens = async (callBack) => {
    const { domain, clientID } = this.auth;
    const { service, account } = this.keytar;
    const refreshToken = await keytar.getPassword(service, account);
    if (refreshToken) {
      const refreshUrl = `https://${domain}/oauth/token`;
      const config: AxiosRequestConfig = {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        data: {
          grant_type: 'refresh_token',
          client_id: clientID,
          refresh_token: refreshToken,
        },
      };
      try {
        const response = await axios(refreshUrl, config);
        return callBack(response);
      } catch (error) {
        await this.logout();
        return callBack(Error(error));
      }
    } else {
      return callBack(Error('No available refresh token.'));
    }
  };

  loadTokens = async (callbackURL) => {
    const { domain, clientID, redirectUri } = this.auth;
    const urlParts = url.parse(callbackURL, true);
    const { query } = urlParts;

    const exchangeOptions = {
      grant_type: 'authorization_code',
      client_id: clientID,
      code: query.code,
      redirect_uri: redirectUri,
    };

    const tokenUrl = `https://${domain}/oauth/token`;
    const config: AxiosRequestConfig = {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      data: JSON.stringify(exchangeOptions),
    };

    try {
      const response = await axios(tokenUrl, config);
      return response;
    } catch (error) {
      await this.logout();
      return Error(error);
    }
  };

  setSession = async (authResult, userProfile) => {
    const { access_token, id_token, refresh_token } = authResult;
    this.tokens.accessToken = access_token;
    this.tokens.idToken = id_token;
    this.tokens.refreshToken = refresh_token;
    this.userProfile = userProfile;

    if (refresh_token) {
      await keytar.setPassword(
        this.keytar.service,
        this.keytar.account,
        refresh_token
      );
    }
  };

  isLoggedIn = () => {
    const expiresAt = localStorage.getItem('expires_at');
    return new Date().getTime() < Number(expiresAt);
  };

  getAccessToken = () => this.tokens.accessToken; // TODO: add electron-storage

  getIdToken = () => this.tokens.idToken;

  getProfile = (cb: CallBack) => {
    // TODO: get /userinfo in case userProfile is null
    return cb(this.userProfile, null);
  };

  interceptIdToken = (idToken: string) => {
    axios.interceptors.request.use(
      (config: AxiosRequestConfig) =>
        onAxiosInterceptorSuccess(config, idToken),
      onAxiosInterceptorFailure
    );
  };

  logout = async () => {
    const { service, account } = this.keytar;
    await keytar.deletePassword(service, account);
    this.tokens = {
      accessToken: null,
      profile: null,
      refreshToken: null,
    };
    this.userProfile = null;
  };
}

type Profile = Record<string, any> | null;
type Error = Record<string, any> | null;
type CallBack = (profile: Profile, error?: Error) => void;
