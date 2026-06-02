import cors from 'cors';
import express from 'express';

import type { Container } from '../bootstrap/Container';
import type { Env } from '../config/env';
import { errorHandler } from './middleware/errorHandler';
import { createNoteRouter } from './routes/noteRoutes';

export function createApp(deps: { env: Env; container: Container }) {
  const app = express();

  app.use(express.json());

  app.use(
    cors({
      origin: deps.env.CLIENT_URL,
    })
  );

  app.use('/notes', createNoteRouter(deps.container));

  app.use((_req, res) => {
    res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: 'Route not found',
      },
    });
  });

  app.use(errorHandler);

  return app;
}
