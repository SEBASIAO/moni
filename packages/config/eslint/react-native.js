// @ts-check
const baseConfig = require('./base');

/** @type {import('eslint').Linter.Config[]} */
module.exports = [
  ...baseConfig,
  {
    rules: {
      // React Native specific
      'no-alert': 'error',
    },
  },
];
