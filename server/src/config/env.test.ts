import { loadEnv } from './env';

const validEnv = {
  NODE_ENV: 'test',
  PORT: '3000',
  CLIENT_URL: 'http://localhost:5173',
  DATABASE_PATH: 'nexus.db',
  OLLAMA_URL: 'http://localhost:11434',
  OLLAMA_MODEL: 'qwen2.5:7b',
  WORKER_POLL_INTERVAL_MS: '5000',
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

    expect(env.NODE_ENV).toBe('test');
    expect(env.PORT).toBe(3000);
    expect(env.CLIENT_URL).toBe('http://localhost:5173');
    expect(env.DATABASE_PATH).toBe('nexus.db');
    expect(env.OLLAMA_URL).toBe('http://localhost:11434');
    expect(env.OLLAMA_MODEL).toBe('qwen2.5:7b');
    expect(env.WORKER_POLL_INTERVAL_MS).toBe(5000);
  });

  it('logs an error and exits for invalid env configuration', () => {
    vi.stubEnv('PORT', 'not-a-number');

    loadEnv();

    expect(console.error).toHaveBeenCalled();
    expect(process.exit).toHaveBeenCalledWith(1);
  });
});
