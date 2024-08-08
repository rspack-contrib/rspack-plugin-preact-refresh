const path = require('node:path');

/** @type {import('jest').Config} */
const config = {
  testEnvironment: './scripts/patch-node-env.cjs',
  setupFilesAfterEnv: ['@rspack/test-tools/setup-expect'],
  testTimeout: process.env.CI ? 60000 : 30000,
  testMatch: ['<rootDir>/test/*.test.js'],
  moduleNameMapper: {
    // Fixed jest-serialize-path not working when non-ascii code contains.
    slash: path.join(__dirname, './scripts/slash.cjs'),
    // disable sourcmap remapping for ts file
    'source-map-support/register': 'identity-obj-proxy',
  },
  cache: false,
  snapshotFormat: {
    escapeString: true,
    printBasicPrototype: true,
  },
  globals: {
    updateSnapshot:
      process.argv.includes('-u') || process.argv.includes('--updateSnapshot'),
  },
};

module.exports = config;
