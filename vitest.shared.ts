export const baseCoverageConfig = {
  provider: 'v8' as const,
  excludeAfterRemap: true,
};

export function prefixGlobs(patterns: string[], dir: string): string[] {
  return patterns.map((p) => `${dir}/${p}`);
}
