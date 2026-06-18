import type { Request, Response } from 'express';

import type GetAllNotesUseCase from '../../../application/use-cases/notes/GetAllNotesUseCase';

export default class GetAllNotesUseCaseController {
  private getAllNotes: GetAllNotesUseCase;

  constructor(getAllNotes: GetAllNotesUseCase) {
    this.getAllNotes = getAllNotes;
  }

  handle = async (_req: Request, res: Response) => {
    const notes = await this.getAllNotes.execute();

    if (notes.length === 0) {
      return res.status(200).json({
        message: 'Success, but no notes found.',
        data: [],
      });
    }

    return res.status(200).json({
      message: 'Found notes.',
      data: { notes },
    });
  };
}
