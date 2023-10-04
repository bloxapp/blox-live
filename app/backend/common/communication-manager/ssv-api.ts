import config from '~app/backend/common/config';
import Http from '~app/backend/common/communication-manager/http';

export default class SsvApi extends Http {
  constructor() {
    super();
    this.baseUrl = config.env.SSV_API;
  }

  init = () => {
    this.instance.defaults.baseURL = this.baseUrl;
  };
}
