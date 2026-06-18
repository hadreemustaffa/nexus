import type { Request, Response } from 'express';

import type GetSingleNoteUseCase from '../../../application/use-cases/notes/GetSingleNoteUseCase';

export default class GetSingleNoteUseCaseController {
  private getSingleNote: GetSingleNoteUseCase;

  constructor(getSingleNote: GetSingleNoteUseCase) {
    this.getSingleNote = getSingleNote;
  }

  handle = async (req: Request, res: Response) => {
    const noteId = req.params.id as string;

    const result = await this.getSingleNote.execute(noteId);

    return res.status(200).json({
      message: 'Note found.',
      data: result,
    });
  };
}
