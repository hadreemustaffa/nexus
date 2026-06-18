import { api, createPromptBodySchema } from '@nexus/shared';
import { Router } from 'express';

import CreatePromptUseCase from '../../application/use-cases/prompts/CreatePromptUseCase';
import GetAllPromptsUseCase from '../../application/use-cases/prompts/GetAllPromptsUseCase';
import { type Container } from '../../bootstrap/Container';
import CreatePromptController from '../controllers/prompts/CreatePromptController';
import GetAllPromptsController from '../controllers/prompts/GetAllPromptsController';
import { asyncHandler } from '../middleware/asyncHandler';
import { validate } from '../middleware/validate';

export function createPromptsRouter(container: Container) {
  const router = Router();

  const createPromptUseCase = new CreatePromptUseCase(
    container.promptRepository
  );
  const getAllPromptsUseCase = new GetAllPromptsUseCase(
    container.promptRepository
  );

  const createPromptController = new CreatePromptController(
    createPromptUseCase
  );
  const getAllPromptsController = new GetAllPromptsController(
    getAllPromptsUseCase
  );

  router.post(
    api.prompts.create.path,
    validate({ body: createPromptBodySchema }),
    asyncHandler(createPromptController.handle)
  );

  router.get(
    api.prompts.root.path,
    asyncHandler(getAllPromptsController.handle)
  );

  return router;
}
