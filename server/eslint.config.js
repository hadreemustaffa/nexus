import globals from 'globals';
import baseConfig from '../eslint.config.js';

export default [
  ...baseConfig,

  {
    files: ['**/*.ts'],

    languageOptions: {
      globals: globals.node,
    },
  },
];
