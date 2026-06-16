import { type UpdateNoteBody } from '@nexus/shared';
import type { Request, Response } from 'express';

import type UpdateNote from '../../../application/use-cases/UpdateNote';

export default class UpdateNoteController {
  private updateNote: UpdateNote;

  constructor(updateNote: UpdateNote) {
    this.updateNote = updateNote;
  }

  handle = async (req: Request, res: Response) => {
    const noteId = req.params.id as string;
    const { title, content } = req.body as UpdateNoteBody;

    const result = await this.updateNote.execute(noteId, title, content);

    return res.status(200).json({
      message: 'Note updated succesfully.',
      data: result,
    });
  };
}
