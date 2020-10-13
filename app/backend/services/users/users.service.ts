import { CatchClass } from '../../decorators';
import BloxApi from '../../common/communication-manager/blox-api';
import { METHOD } from '../../common/communication-manager/constants';

@CatchClass<VersionService>()
export default class VersionService {
  async update(payload: Record<string, any>) {
    return await BloxApi.request(METHOD.PATCH, 'users', payload);
  }
}
