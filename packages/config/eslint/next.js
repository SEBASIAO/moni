// @ts-check
const baseConfig = require('./base');

/** @type {import('eslint').Linter.Config[]} */
module.exports = [
  ...baseConfig,
  {
    rules: {
      // Next.js specific — no-html-link-for-pages enforced by next/core-web-vitals
      '@next/next/no-html-link-for-pages': 'error',
      '@next/next/no-img-element': 'error',
    },
  },
];
