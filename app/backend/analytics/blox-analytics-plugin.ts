import BloxApi from '../common/communication-manager/blox-api';
import { METHOD } from '../common/communication-manager/constants';

export default function bloxAnalyticsPlugin(pluginConfig = {}) {
  // return object for analytics to use
  const bloxApi = new BloxApi();

  return {
    /* All plugins require a name */
    name: 'blox-analytics-plugin',
    /* Everything else below this is optional depending on your plugin requirements */
    config: {
      ...pluginConfig
    },
    initialize: async ({ config }) => {
      console.log('init', config);
      bloxApi.init();
      // load provider script to page
    },
    page: async ({ payload }) => {
      // call provider specific page tracking
      console.log('page', payload);
      await bloxApi.request(METHOD.PUT, 'analytics/page', payload);
    },
    track: async ({ payload }) => {
      console.log('track', payload);
      await bloxApi.request(METHOD.PUT, 'analytics/track', payload);
      // call provider specific event tracking
    },
    identify: async ({ payload }) => {
      console.log('identify', payload);
      await bloxApi.request(METHOD.PUT, 'analytics/identify', payload);
      // call provider specific user identify method
    },
    loaded: () => {
      // return boolean so analytics knows when it can send data to third party
      return true;
    }
  };
}
