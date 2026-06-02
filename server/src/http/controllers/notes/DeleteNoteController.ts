import type { Request, Response } from 'express';

import type DeleteNote from '../../../application/use-cases/DeleteNote';

export default class DeleteNoteController {
  private deleteNote: DeleteNote;

  constructor(deleteNote: DeleteNote) {
    this.deleteNote = deleteNote;
  }

  handle = async (req: Request, res: Response) => {
    const noteId = req.params.id as string;

    await this.deleteNote.execute(noteId);

    return res.status(200).json({
      message: 'Note deleted successfully.',
    });
  };
}
