import { CatchClass } from '../../decorators';
import BloxApi from '../../common/communication-manager/blox-api';
import { METHOD } from '../../common/communication-manager/constants';

export enum SSVMigrationStatus {
  NOT_STARTED = 0,
  CREATED_KEYSHARES = 1,
  DOWNLOADED_KEYSHARES = 2,
  FINISHED = 3,
}

@CatchClass<UserService>()
export default class UserService {
  private readonly bloxApi: BloxApi;
  private static service: UserService;

  constructor() {
    this.bloxApi = new BloxApi();
    this.bloxApi.init();
  }

  static getInstance() {
    if (!this.service) {
      this.service = new UserService();
      return this.service;
    }
    return this.service;
  }

  async get() {
    return await this.bloxApi.request(METHOD.GET, 'users/profile');
  }

  async getTemporaryToken() {
    return await this.bloxApi.request(METHOD.POST, 'tokens');
  }

  async update(payload: Record<string, any>) {
    return await this.bloxApi.request(METHOD.PATCH, 'users', payload);
  }
}
