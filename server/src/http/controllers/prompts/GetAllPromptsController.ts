import { Request, Response } from 'express';

import GetAllPrompts from '../../../application/use-cases/prompts/GetAllPrompts';

export default class GetAllPromptsController {
  private getAllPrompts: GetAllPrompts;

  constructor(getAllPrompts: GetAllPrompts) {
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

    return res.status(201).json({
      message: 'Prompts found.',
      data: { prompts },
    });
  };
}
