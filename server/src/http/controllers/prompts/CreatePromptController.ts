import { type CreatePromptBody } from '@nexus/shared';
import { type Request, type Response } from 'express';

import type CreatePromptUseCase from '../../../application/use-cases/prompts/CreatePromptUseCase';

export default class CreatePromptUseCaseController {
  private createPrompt: CreatePromptUseCase;

  constructor(createPrompt: CreatePromptUseCase) {
    this.createPrompt = createPrompt;
  }

  handle = async (req: Request, res: Response) => {
    const { key, content } = req.body as CreatePromptBody;

    const result = await this.createPrompt.execute(key, content);

    return res.status(201).json({
      message: 'Prompt created successfully',
      data: result,
    });
  };
}
