import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  outDir: 'dist',
  format: ['esm'],
  sourcemap: true,
  clean: true,
  dts: false,
  minify: true,
  onSuccess: 'tsc -p tsconfig.json',
  external: ['@nexus/shared'],
});
