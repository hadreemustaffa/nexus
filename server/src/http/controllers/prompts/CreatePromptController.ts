import { Request, Response } from 'express';

import CreatePrompt from '../../../application/use-cases/prompts/CreatePrompt';

export default class CreatePromptController {
  private createPrompt: CreatePrompt;

  constructor(createPrompt: CreatePrompt) {
    this.createPrompt = createPrompt;
  }

  handle = async (req: Request, res: Response) => {
    const { key, content } = req.body;

    const result = await this.createPrompt.execute(key, content);

    return res.status(201).json({
      message: 'Prompt created successfully',
      data: result,
    });
  };
}
