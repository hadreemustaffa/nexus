import type { Request, Response } from 'express';

import type GetSingleNote from '../../../application/use-cases/GetSingleNote';

export default class GetSingleNoteController {
  private getSingleNote: GetSingleNote;

  constructor(getSingleNote: GetSingleNote) {
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
