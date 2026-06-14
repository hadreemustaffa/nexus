import { Router } from 'express';

import { Container } from '../../bootstrap/Container';
import { createNotesRouter } from './noteRoutes';
import { createPromptsRouter } from './promptRoutes';

export function createRouters(container: Container) {
  const router = Router();

  router.use('/notes', createNotesRouter(container));
  router.use('/prompts', createPromptsRouter(container));

  return router;
}
