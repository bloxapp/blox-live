import Store from './store-manager/store';

export default class Config {
  private static instance: Config;
  private settings: any = {
    stage: {
      AUTH0_DOMAIN: 'blox-infra.eu.auth0.com',
      AUTH0_CLIENT_ID: 'NsZvhkQvZOWwXT2rcA1RWGgA7YxxhsJZ',
      API_URL: 'https://api.stage.bloxstaking.com'
    },
    production: {
      AUTH0_DOMAIN: 'blox-infra.eu.auth0.com',
      AUTH0_CLIENT_ID: 'UoQRP1Ndd5C0Y2VQyrHxZ7W9JXg7yRTv',
      API_URL: 'https://api.bloxstaking.com'
    },
    default: {
      AUTH0_LOGOUT_URL: 'https://localhost:1212',
      AUTH0_CALLBACK_URL: 'file:///callback*',
      WEBSITE_URL: 'https://www.bloxstaking.com',
      DISCORD_INVITE: 'https://discord.com/invite/VgHDdAP',
      DISCORD_GOETH_INVITE: 'https://discord.gg/wXxuQwY',
      HTTP_RETRIES: 3,
      HTTP_RETRY_DELAY: 1000,
      TEST_NETWORK: 'test',
      ZINKEN_NETWORK: 'zinken'
    }
  };

  private constructor() {
    const backendStore = Store.getStore();
    const envKey = (backendStore.get('env') || 'production');
    // env related
    // eslint-disable-next-line no-restricted-syntax
    for (const key of Object.keys(this.settings[envKey])) {
      Object.defineProperty(this, key, {
        get: () => this.settings[envKey][key]
      });
    }

    // default
    // eslint-disable-next-line no-restricted-syntax
    for (const key of Object.keys(this.settings.default)) {
      Object.defineProperty(this, key, {
        get: () => this.settings.default[key]
      });
    }
  }

  static get env(): any {
    if (!this.instance) {
      this.instance = new Config();
    }
    return this.instance;
  }
}
