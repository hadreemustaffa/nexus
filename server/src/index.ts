import 'dotenv/config';

import bootstrap from './bootstrap';
import { createApp } from './http/app';

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await bootstrap();

    const app = createApp();

    app.listen(PORT, () => {
      console.log(`Nexus server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start application:', error);

    process.exit(1);
  }
}

start();
