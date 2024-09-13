const ReactRefreshRspackPlugin = require('../../../..');

/** @type {import('@rspack/core').Configuration} */
module.exports = {
  mode: 'development',
  target: 'web',
  context: __dirname,
  entry: './index.js',
  plugins: [new ReactRefreshRspackPlugin({
    exclude: /file\.js/,
  })],
};
