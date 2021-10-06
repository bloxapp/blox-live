import { isVersionHigherOrEqual } from '~app/utils/service';
import BaseStore from '~app/backend/common/store-manager/base-store';
import Connection from '~app/backend/common/store-manager/connection';

export default class Config {
  private static instance: Config;
  private settings: any = {
    stage: {
      REFRESH_TOKEN_URL: 'https://api.stage.bloxstaking.com/auth/token/refresh',
      COMPLIANCE_URL: 'https://api.stage.bloxstaking.com/compliance/countries/restricted',
      // COMPLIANCE_URL: 'http://localhost:3001/compliance/countries/restricted',
      AUTH0_DOMAIN: 'blox-infra.eu.auth0.com',
      AUTH0_CLIENT_ID: 'NsZvhkQvZOWwXT2rcA1RWGgA7YxxhsJZ',
      API_URL: 'https://api.stage.bloxstaking.com',
      WEB_APP_URL: 'https://app.stage.bloxstaking.com'
    },
    production: {
      REFRESH_TOKEN_URL: 'https://api.bloxstaking.com/auth/token/refresh',
      COMPLIANCE_URL: 'https://api.bloxstaking.com/compliance/countries/restricted',
      AUTH0_DOMAIN: 'blox-infra.eu.auth0.com',
      AUTH0_CLIENT_ID: 'UoQRP1Ndd5C0Y2VQyrHxZ7W9JXg7yRTv',
      API_URL: 'https://api.bloxstaking.com',
      WEB_APP_URL: 'https://app.bloxstaking.com'
    },
    default: {
      AUTH0_LOGOUT_URL: 'https://localhost:1212',
      AUTH0_CALLBACK_URL: 'file:///login/callback*',
      WEBSITE_URL: 'https://www.bloxstaking.com',
      DISCORD_INVITE: 'http://bit.ly/30HwvsC',
      DISCORD_GOETH_INVITE: 'https://discord.gg/wXxuQwY',
      HTTP_RETRIES: 3,
      HTTP_RETRY_DELAY: 1000,
      PRATER_NETWORK: 'prater',
      MAINNET_NETWORK: 'mainnet',
      SSL_SUPPORTED_TAG: 'v0.1.25',
      HIGHEST_ATTESTATION_SUPPORTED_TAG: 'v0.3.2',
      DEFAULT_SSH_PORT: 22,
      TARGET_SSH_PORT: 2200,
      BEACONCHA_URL: 'https://beaconcha.in/api/v1',
      PRATER_BEACONCHA_URL: 'https://prater.beaconcha.in/api/v1',
      INFURA_API_KEY: 'ad49ce6ad5d64c2685f4b2ba86512c76',
      ETH_INITIAL_BALANCE: 32.00,
      UNAUTHORIZED_CHECK_INTERVAL: 10 * 60 * 1000,
      CONTACT_US_LINK: 'http://bit.ly/2Nqy2Ao',
      KNOWLEDGE_BASE_LINK: 'http://bit.ly/3eFOyHH',
      SEND_FEEDBACK_LINK: 'http://bit.ly/3eK2cts',
      LAUNCHPAD_URL: {
        MAINNET: 'https://launchpad.ethereum.org/',
        TESTNET: 'https://prater.launchpad.ethereum.org/',
      },
      CREATE_BLOX_ACCOUNTS_BATCH_SIZE: 50,

      // Wizard pages constants in one central place, environment-independent
      WIZARD_PAGES: {
        START_PAGE: 0,
        WALLET: {
          SELECT_CLOUD_PROVIDER: 1,
          CREATE_SERVER: 2,
          CONGRATULATIONS: 3,
          SEED_OR_KEYSTORE: 3.5, // Keystore or Seed mode switch
          IMPORT_OR_GENERATE_SEED: 4,
          ENTER_MNEMONIC: 5,
          IMPORT_MNEMONIC: 10,
          IMPORT_VALIDATORS: 11
        },
        ACCOUNT: {
          SET_PASSWORD: 20, // Keystore mode
        },
        VALIDATOR: {
          SELECT_NETWORK: 6,
          UPLOAD_KEYSTORE_FILE: 6.5, // Keystore mode
          CREATE_VALIDATOR: 7,
          VALIDATOR_SUMMARY: 7.1, // Keystore mode
          SLASHING_WARNING: 7.2, // Keystore mode - shown only for "deposited" validators
          DEPOSIT_OVERVIEW: 7.3, // Keystore mode - shown only for "not deposited" validators
          UPLOAD_DEPOSIT_FILE: 7.4, // Keystore mode - shown only for "not deposited" validators
          STAKING_DEPOSIT: 8,
          CONGRATULATIONS: 9
        }
      },
      WIZARD_STEPS: {
        KEY_VAULT_SETUP: 1,
        VALIDATOR_SETUP: 2,
        ACCOUNT_SETUP: 3, // Keystore mode
      },
      FLAGS: {
        DASHBOARD: {
          TESTNET_SHOW: 'dashboard:testNet:show',
        },
        AUTH: {
          TEST_EXPIRED_ACCESS_TOKEN: 'auth:expired:test',
        },
        FEATURES: {
          IMPORT_NETWORK: 'feature:import:network'
        },
        COMPLIANCE: {
          RESTRICTED_TEST: 'compliance:restricted:test'
        },
        VALIDATORS_MODE: {
          KEY: 'VALIDATORS_MODE',
          SEED: 'seed',
          KEYSTORE: 'keystore'
        },
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

  static get WIZARD_PAGES(): any {
    return this.env.WIZARD_PAGES;
  }

  static get WIZARD_STEPS(): any {
    return this.env.WIZARD_STEPS;
  }

  static get FLAGS(): any {
    return this.env.FLAGS;
  }

  static get TESTNET_NETWORK(): string {
    const keyVaultVersion = Connection.db().get('keyVaultVersion');
    if (isVersionHigherOrEqual(keyVaultVersion, 'v1.2.0')) {
      return 'prater';
    }
    return 'pyrmont';
  }
}
