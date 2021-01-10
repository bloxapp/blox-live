import axios from 'axios';
import axiosRetry from 'axios-retry';
import { Catch } from '../../decorators';
import config from '../config';

export default class Http {
  baseUrl?: string;
  protected instance: any;

  constructor() {
    this.instance = axios.create();
    axiosRetry(this.instance, {
      retries: +config.env.HTTP_RETRIES,
      retryDelay: (retryCount) => {
        return retryCount * +config.env.HTTP_RETRY_DELAY;
      }
    });
  }

  @Catch()
  async request(method: string, url: string, data: any = null, headers: any = null, fullResponse: boolean = false): Promise<any> {
    const response = await this.instance({
      url,
      method,
      data,
      headers: { ...this.instance.defaults.headers.common, ...headers }
    });
    return fullResponse ? response : response.data;
  }
}
