import { defineConfig } from 'vitest/config';
import { baseCoverageConfig } from '../vitest.shared';

export const coverage = {
  include: ['src/**/*.ts'],
  exclude: ['src/index.ts', '**/bootstrap/**'],
  thresholds: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80,
  },
};

export default defineConfig({
  test: {
    name: 'server',
    globals: true,
    environment: 'node',
    silent: 'passed-only',
    include: ['src/**/*.{test,spec}.ts'],
    coverage: {
      ...baseCoverageConfig,
      reporter: ['text', 'json', 'html'],
      ...coverage,
    },
  },
});
