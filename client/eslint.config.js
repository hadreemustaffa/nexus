// client/eslint.config.js

import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

import baseConfig from '../eslint.config.js';

export default [
  ...baseConfig,

  {
    files: ['**/*.{ts,tsx}'],

    languageOptions: {
      globals: globals.browser,
    },
  },

  reactHooks.configs.flat.recommended,
  reactRefresh.configs.vite,
];
