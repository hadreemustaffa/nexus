import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';
import { baseCoverageConfig } from '../vitest.shared';

export const coverage = {
  include: ['src/**/*.{ts,tsx}'],
  exclude: ['src/**/*.{test,spec}.{ts,tsx}', 'src/main.tsx', 'src/test/**'],
  thresholds: {
    branches: 65,
    functions: 70,
    lines: 70,
    statements: 70,
  },
};

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      name: 'client',
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
      coverage: {
        ...baseCoverageConfig,
        reporter: ['text', 'json', 'html'],
        ...coverage,
      },
    },
  })
);
