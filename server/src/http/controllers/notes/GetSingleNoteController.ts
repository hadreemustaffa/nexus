import type { Request, Response } from 'express';

import type GetSingleNote from '../../../application/use-cases/GetSingleNote';

export default class GetSingleNoteController {
  private getSingleNote: GetSingleNote;

  constructor(getSingleNote: GetSingleNote) {
    this.getSingleNote = getSingleNote;
  }

  handle = async (req: Request, res: Response): Promise<Response> => {
    try {
      const noteId = req.params.id as string;

      const result = await this.getSingleNote.execute(noteId);

      return res.status(200).json({
        message: 'Note found.',
        data: result,
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({
          error: 'Bad Request',
          message: error.message,
        });
      }

      return res.status(500).json({
        error: 'Internal Server Error',
      });
    }
  };
}
