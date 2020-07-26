/**
 * Base webpack config used across other specific configs
 */

import path from 'path';
import webpack from 'webpack';
import { dependencies as externals } from '../app/package.json';

// TODO: add ts-loader and implement js
export default {
  externals: [...Object.keys(externals || {})],

  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },

  output: {
    path: path.join(__dirname, '..', 'app'),
    // https://github.com/webpack/webpack/issues/1114
    libraryTarget: 'commonjs2',
  },

  /**
   * Determine the array of extensions that should be used to resolve modules.
   */
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
    modules: [path.join(__dirname, '..', 'app'), 'node_modules'],
  },

  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production',
      AUTH0_DOMAIN: 'blox-infra.eu.auth0.com',
      AUTH0_CLIENT_ID: 'jzPv6jHUpv7xQfmkNqL8bITplzvI5Bib',
      AUTH0_LOGOUT_URL: 'http://localhost',
      AUTH0_CALLBACK_URL: 'http://localhost/callback',
      API_URL: 'http://api.stage.bloxstaking.com',
      // BACKEND: true
    }),

    new webpack.NamedModulesPlugin(),
  ],
};
