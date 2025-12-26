const { FlatCompat } = require('@eslint/eslintrc');
const js = require('@eslint/js');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

module.exports = [
  {
    ignores: [
      'android/**',
      'dist/**',
      'eslint.config.js',
      'node_modules/**',
      'server/**',
    ],
  },
  ...compat.extends('expo'),
  {
    languageOptions: {
      globals: {
        clearTimeout: 'readonly',
        setTimeout: 'readonly',
      },
    },
  },
];
