import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  CLIENT_URL: z.url().default('http://localhost:5173'),
  DATABASE_PATH: z.string().min(1).default('nexus.db'),
  OLLAMA_URL: z.url().default('http://localhost:11434'),
  OLLAMA_MODEL: z.string().min(1).default('qwen2.5:7b'),
  LOG_LEVEL: z
    .enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal', 'silent'])
    .default('info'),
  WORKER_POLL_INTERVAL_MS: z.coerce.number().int().positive().default(5000),
});

export type NodeEnv = z.infer<typeof envSchema.shape.NODE_ENV>;
export type LogLevel = z.infer<typeof envSchema.shape.LOG_LEVEL>;
export type Env = z.infer<typeof envSchema>;

export function loadEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    // purposely using console.error here
    // because logger is not yet initialized
    console.error('Invalid environment configuration:');
    console.error(z.treeifyError(result.error));
    process.exit(1);
  }

  return result.data;
}
