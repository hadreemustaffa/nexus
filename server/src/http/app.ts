import cors from 'cors';
import express from 'express';

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

  return app;
}
