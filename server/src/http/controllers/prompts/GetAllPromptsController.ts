import { type Request, type Response } from 'express';

import type GetAllPromptsUseCase from '../../../application/use-cases/prompts/GetAllPromptsUseCase';

export default class GetAllPromptsUseCaseController {
  private getAllPrompts: GetAllPromptsUseCase;

  constructor(getAllPrompts: GetAllPromptsUseCase) {
    this.getAllPrompts = getAllPrompts;
  }

  handle = async (_req: Request, res: Response) => {
    const prompts = await this.getAllPrompts.execute();

    if (prompts.length === 0) {
      return res.status(200).json({
        message: 'Success, but no prompts found.',
        data: [],
      });
    }

    return res.status(200).json({
      message: 'Prompts found.',
      data: { prompts },
    });
  };
}
