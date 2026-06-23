import globals from 'globals';

import baseConfig from '../eslint.config.js';

export default [
  ...baseConfig,

  {
    files: ['**/*.ts'],
    languageOptions: {
      globals: globals.node,
    },

    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
      'import-x/no-restricted-paths': [
        'error',
        {
          basePath: import.meta.dirname,
          zones: [
            // e.g. src/infrastructure can import from src/application but not the other way around
            {
              target: './src/application',
              from: './src/infrastructure',
              message:
                'Application layer cannot import from Infrastructure layer.',
            },
          ],
        },
      ],
    },
  },
];
