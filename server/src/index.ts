import 'dotenv/config';

import bootstrap from './bootstrap';
import { createContainer } from './bootstrap/Container';
import { loadEnv } from './config/env';
import { createApp } from './http/app';

const env = loadEnv();
const container = createContainer(env);

async function start() {
  try {
    await bootstrap(container, env);

    const app = createApp({ env, container });

    app.listen(env.PORT, () => {
      console.log(`Nexus server running on http://localhost:${env.PORT}`);
    });
  } catch (error) {
    console.error('Failed to start application:', error);

    process.exit(1);
  }
}

start();
