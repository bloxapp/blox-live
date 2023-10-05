import { METHOD } from '~app/backend/common/communication-manager/constants';
import SsvApi from '../../common/communication-manager/ssv-api';

export default class SsvApiService {
  private readonly ssvApi: SsvApi;

  constructor() {
    this.ssvApi = new SsvApi();
    this.ssvApi.init();
  }

  async getAccountData(address: string) {
    return await this.ssvApi.request(METHOD.GET, `/accounts/${address}`);
  }

  async getOperatorsByIds(ids: string[] | number[]) {
    return await this.ssvApi.request(METHOD.POST, '/operators', {ids});
  }
}
