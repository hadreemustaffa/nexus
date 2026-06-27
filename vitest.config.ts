import { defineConfig } from 'vitest/config';

import { coverage as serverCoverage } from './server/vitest.config';
import { coverage as clientCoverage } from './client/vitest.config';
import { coverage as sharedCoverage } from './packages/shared/vitest.config';
import { baseCoverageConfig, prefixGlobs } from './vitest.shared';

const projects = [
  { dir: 'server', coverage: serverCoverage },
  { dir: 'client', coverage: clientCoverage },
  { dir: 'packages/shared', coverage: sharedCoverage },
];

export default defineConfig({
  test: {
    silent: 'passed-only',

    projects: [
      './client/vitest.config.ts',
      './server/vitest.config.ts',
      './packages/shared/vitest.config.ts',
    ],
    coverage: {
      ...baseCoverageConfig,
      reporter: ['text', 'json', 'html'],
      include: projects.flatMap((p) => prefixGlobs(p.coverage.include, p.dir)),
      exclude: [
        ...projects.flatMap((p) =>
          prefixGlobs(p.coverage.exclude ?? [], p.dir)
        ),
        '**/src/**/*.{test,spec}.ts',
        '**/src/tests/**',
        '**/node_modules/**',
      ],
      thresholds: Object.fromEntries(
        projects
          .filter((p) => p.coverage?.thresholds)
          .map((p) => [`${p.dir}/src/**/*.ts`, p.coverage.thresholds])
      ),
    },
  },
});
