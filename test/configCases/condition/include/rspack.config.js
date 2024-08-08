const ReactRefreshRspackPlugin = require('../../../..');

/** @type {import('@rspack/core').Configuration} */
module.exports = {
  mode: 'development',
  context: __dirname,
  entry: './index.js',
  plugins: [new ReactRefreshRspackPlugin({
    exclude: /$^/,  // match nothing
    include: /foo/,
  })],
};
