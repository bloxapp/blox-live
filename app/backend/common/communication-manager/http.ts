import axios from 'axios';
import config from '../config';
import axiosRetry from 'axios-retry';
import { Log } from '../logger/logger';
import { Catch } from '../../decorators';
export default class Http {
  baseUrl?: string;
  protected instance: any;
  protected logger: Log;

  constructor() {
    this.logger = new Log();
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
    try {
      const response = await this.instance({
        url,
        method,
        data,
        headers: { ...this.instance.defaults.headers.common, ...headers }
      });
      return fullResponse ? response : response.data;
    } catch (error) {
      this.logger.error(url, error);
      throw error;
    }
  }
}
