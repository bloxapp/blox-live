import { CatchClass } from '~app/backend/decorators';
import Connection from '~app/backend/common/store-manager/connection';
import BloxApi from '~app/backend/common/communication-manager/blox-api';
import { METHOD } from '~app/backend/common/communication-manager/constants';

@CatchClass<VersionService>()
export default class VersionService {
  private readonly bloxApi: BloxApi;

  constructor() {
    this.bloxApi = new BloxApi();
    this.bloxApi.init();
  }

  async getLatestKeyVaultVersion() {
    if (Connection.db().exists('customKeyVaultVersion')) {
      return Connection.db().get('customKeyVaultVersion');
    }
    return await this.bloxApi.request(METHOD.GET, 'version/key-vault');
  }

  async getLatestBloxLiveVersion() {
    return await this.bloxApi.request(METHOD.GET, 'version/blox-live');
  }
}
