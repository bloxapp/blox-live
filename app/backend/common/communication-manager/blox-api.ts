import Http from './http';
import config from '../config';
import Connection from '../store-manager/connection';
export default class BloxApi extends Http {
  private storePrefix: string;
  private notAuthRequest: boolean;

  constructor(prefix: string = '', notAuthRequest = false) {
    super();
    this.storePrefix = prefix;
    this.baseUrl = config.env.API_URL;
    this.notAuthRequest = notAuthRequest;
  }

  init = () => {
    this.instance.defaults.baseURL = this.baseUrl;
    if (!this.notAuthRequest) {
      this.instance.defaults.headers.common.Authorization = `Bearer ${Connection.db(this.storePrefix).get('authToken')}`;
    }
  };
}
