import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

import baseConfig from '../eslint.config.js';

export default [
  ...baseConfig,

  reactHooks.configs.flat.recommended,
  reactRefresh.configs.vite,

  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      globals: globals.browser,
    },

    rules: {
      'no-console': ['error', { allow: ['warn', 'error'] }],
      '@typescript-eslint/only-throw-error': [
        'error',
        {
          allow: ['Response'],
        },
      ],
    },
  },
];
