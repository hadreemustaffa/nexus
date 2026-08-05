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
      container.logger.info(
        {},
        `Nexus server running on http://localhost:${env.PORT}`
      );
    });
  } catch (error) {
    container.logger.error({ error: error }, 'Failed to start application:');

    process.exit(1);
  }
}

await start();
