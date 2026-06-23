import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'server',
    globals: true,
    environment: 'node',
    silent: 'passed-only',
    include: ['src/**/*.{test,spec}.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      // fails if any metric drops below 80%
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.{test,spec}.ts',
        'src/index.ts',
        'src/bootstrap/index.ts',
      ],
    },
  },
});
