import config from '~app/backend/common/config';
import Http from '~app/backend/common/communication-manager/http';
import {METHOD} from '~app/backend/common/communication-manager/constants';

export default class SsvApi extends Http {
  constructor() {
    super();
    this.baseUrl = config.env.SSV_API_URL;
  }

  init = () => {
    this.instance.defaults.baseURL = this.baseUrl;
  };

  async getAccountData(address: string) {
    return await this.request(METHOD.GET, `/accounts/${address}`);
  }

  async getOperatorsByIds(ids: string[] | number[]) {
    return await this.request(METHOD.POST, '/operators', {ids});
  }
}
