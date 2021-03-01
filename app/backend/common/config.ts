import BaseStore from './store-manager/base-store';

export default class Config {
  private static instance: Config;
  private settings: any = {
    stage: {
      AUTH0_DOMAIN: 'blox-infra.eu.auth0.com',
      AUTH0_CLIENT_ID: 'NsZvhkQvZOWwXT2rcA1RWGgA7YxxhsJZ',
      API_URL: 'https://api.stage.bloxstaking.com',
      WEB_APP_URL: 'https://app.stage.bloxstaking.com'
    },
    production: {
      AUTH0_DOMAIN: 'blox-infra.eu.auth0.com',
      AUTH0_CLIENT_ID: 'UoQRP1Ndd5C0Y2VQyrHxZ7W9JXg7yRTv',
      API_URL: 'https://api.bloxstaking.com',
      WEB_APP_URL: 'https://app.bloxstaking.com'
    },
    default: {
      AUTH0_LOGOUT_URL: 'https://localhost:1212',
      AUTH0_CALLBACK_URL: 'file:///callback*',
      WEBSITE_URL: 'https://www.bloxstaking.com',
      DISCORD_INVITE: 'https://discord.com/invite/VgHDdAP',
      DISCORD_GOETH_INVITE: 'https://discord.gg/wXxuQwY',
      HTTP_RETRIES: 3,
      HTTP_RETRY_DELAY: 1000,
      PYRMONT_NETWORK: 'pyrmont',
      MAINNET_NETWORK: 'mainnet',
      TESTNET: {
        GOERLI_NETWORK: 'goerli'
      },
      SSL_SUPPORTED_TAG: 'v0.1.25',
      HIGHEST_ATTESTATION_SUPPORTED_TAG: 'v0.3.2',
      DEFAULT_SSH_PORT: 22,
      TARGET_SSH_PORT: 2200,
      BEACONCHA_URL: 'https://beaconcha.in/api/v1',
      PYRMONT_BEACONCHA_URL: 'https://pyrmont.beaconcha.in/api/v1',
      INFURA_API_KEY: 'ad49ce6ad5d64c2685f4b2ba86512c76',
      ETH_INITIAL_BALANCE: 32.00,

      // Application pages constants in one central place, environment-independent
      APP_PAGES: {
        WELCOME: {
          DEFAULT: 0
        },
        WALLET: {
          SELECT_CLOUD_PROVIDER: 1,
          CREATE_SERVER: 2,
          CONGRATULATIONS: 3,
          IMPORT_OR_GENERATE_SEED: 4,
          ENTER_MNEMONIC: 5,
          IMPORT_MNEMONIC: 10,
          IMPORT_VALIDATORS: 11
        },
        VALIDATOR: {
          SELECT_NETWORK: 6,
          CREATE_VALIDATOR: 7,
          STAKING_DEPOSIT: 8,
          CONGRATULATIONS: 9
        }
      },
      APP_STEPS: {
        WIZARD: {
          KEY_VAULT_SETUP: 1,
          VALIDATOR_SETUP: 2,
        }
      },
      FLAGS: {
        DASHBOARD: {
          TESTNET_HIDDEN: 'dashboard:testNet:isHidden',
        },
        FEATURES: {
          IMPORT_NETWORK: 'feature:import:network'
        }
      }
    }
  };

  private constructor() {
    const baseStore: BaseStore = new BaseStore();
    const envKey = baseStore.get('env') || 'production';
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

    Object.defineProperty(this, 'port', {
      get: () => {
        return this.settings.default.DEFAULT_SSH_PORT;
      }
    });
  }

  static get env(): any {
    if (!this.instance) {
      this.instance = new Config();
    }
    return this.instance;
  }

  static get PAGES(): any {
    return this.env.APP_PAGES;
  }

  static get STEPS(): any {
    return this.env.APP_STEPS;
  }

  static get FLAGS(): any {
    return this.env.FLAGS;
  }
}
