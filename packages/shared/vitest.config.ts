import { defineConfig } from 'vitest/config';
import { baseCoverageConfig } from '../../vitest.shared';

export const coverage = {
  include: ['src/**/*.ts'],
  exclude: ['src/**/*.{test,spec}.ts', 'src/**/messages.ts', 'src/index.ts'],
  thresholds: {
    branches: 85,
    functions: 85,
    lines: 85,
    statements: 85,
  },
};

export default defineConfig({
  test: {
    name: 'shared',
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.ts'],
    coverage: {
      ...baseCoverageConfig,
      reporter: ['text', 'json', 'html'],
      ...coverage,
    },
  },
});
