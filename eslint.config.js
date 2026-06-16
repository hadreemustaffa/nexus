import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import { importX, createNodeResolver } from 'eslint-plugin-import-x';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import checkFile from 'eslint-plugin-check-file';

export default defineConfig([
  globalIgnores([
    'dist',
    'node_modules',
    'build',
    'coverage',
    '*.config.{js,ts}',
  ]),

  js.configs.recommended,

  {
    plugins: {
      'simple-import-sort': simpleImportSort,
      'import-x': importX,
      'check-file': checkFile,
    },

    settings: {
      'import-x/resolver-next': [
        createTypeScriptImportResolver({
          project: [
            './client/tsconfig.app.json',
            './server/tsconfig.json',
            './packages/shared/tsconfig.json',
          ],
        }),
        createNodeResolver(),
      ],
    },

    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'import-x/no-cycle': 'error',
      'linebreak-style': ['error', 'unix'],
      'check-file/folder-naming-convention': [
        'error',
        { '**/*': 'KEBAB_CASE' },
      ],
    },
  },

  {
    files: ['**/*.ts', '**/*.tsx'],

    extends: [...tseslint.configs.recommendedTypeChecked],

    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },

    rules: {
      'import-x/no-cycle': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
    },
  },

  {
    files: ['src/**/*.{ts,tsx}'],

    rules: {
      'import-x/no-cycle': 'error',
    },
  },
]);
