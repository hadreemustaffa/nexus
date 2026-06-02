import cors from 'cors';
import express from 'express';

import { errorHandler } from './middleware/errorHandler';
import { createNoteRouter } from './routes/noteRoutes';

export function createApp() {
  const app = express();

  const CLIENT_URL = process.env.CLIENT_URL;

  app.use(express.json());

  app.use(
    cors({
      origin: CLIENT_URL,
    })
  );

  app.use('/notes', createNoteRouter());

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
