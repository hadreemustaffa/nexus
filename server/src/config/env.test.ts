import { Env, loadEnv } from './env';

const validEnv: Env = {
  NODE_ENV: 'test',
  PORT: 3000,
  CLIENT_URL: 'http://localhost:5173',
  DATABASE_PATH: 'nexus.db',
  OLLAMA_URL: 'http://localhost:11434',
  OLLAMA_MODEL: 'qwen2.5:7b',
  WORKER_POLL_INTERVAL_MS: 5000,
  LOG_LEVEL: 'info',
};

describe('env', () => {
  beforeEach(() => {
    Object.entries(validEnv).forEach(([key, value]) => {
      vi.stubEnv(key, String(value));
    });

    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(process, 'exit').mockImplementation((() => undefined) as never);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('applies default values correctly on valid env input', () => {
    const env = loadEnv();

    expect(env).toEqual(validEnv);
  });

  it('logs an error and exits for invalid env configuration', () => {
    vi.stubEnv('PORT', 'not-a-number');

    loadEnv();

    expect(console.error).toHaveBeenCalled();
    expect(process.exit).toHaveBeenCalledWith(1);
  });
});
