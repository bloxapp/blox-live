import Analytics from 'analytics';
import bloxAnalyticsPlugin from '~app/backend/analytics/blox-analytics-plugin';

const analytics = Analytics({
  app: 'blox-live',

  plugins: [
    bloxAnalyticsPlugin(),
  ]
});

/* export the instance for usage in your app */
export default analytics;
