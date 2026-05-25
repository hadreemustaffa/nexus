import type { Request, Response } from 'express';

import type UpdateNote from '../../../application/use-cases/UpdateNote';

export default class UpdateNoteController {
  private updateNote: UpdateNote;

  constructor(updateNote: UpdateNote) {
    this.updateNote = updateNote;
  }

  handle = async (req: Request, res: Response): Promise<Response> => {
    try {
      const noteId = req.params.id as string;
      const { title, content } = req.body;

      const result = await this.updateNote.execute(noteId, title, content);

      return res.status(200).json({
        message: 'Note updated succesfully.',
        data: result,
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({
          error: 'Bad Request',
          message: error.message,
        });
      }
    }

    return res.status(500).json({
      error: 'Internal Server Error',
    });
  };
}
