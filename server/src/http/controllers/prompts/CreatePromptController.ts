import { type CreatePromptBody } from '@nexus/shared';
import { type Request, type Response } from 'express';

import type CreatePrompt from '../../../application/use-cases/prompts/CreatePrompt';

export default class CreatePromptController {
  private createPrompt: CreatePrompt;

  constructor(createPrompt: CreatePrompt) {
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
