import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

// Merge instead of redefine — inherits the React plugin for JSX transform
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
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        include: ['src/**/*.{ts,tsx}'],
        exclude: [
          'src/**/*.{test,spec}.{ts,tsx}',
          'src/main.tsx', // entry point, nothing to test
          'src/test/**',
        ],
      },
    },
  })
);
