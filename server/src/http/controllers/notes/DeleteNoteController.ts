import type { Request, Response } from 'express';

import type DeleteNoteUseCase from '../../../application/use-cases/notes/DeleteNoteUseCase';

export default class DeleteNoteUseCaseController {
  private deleteNote: DeleteNoteUseCase;

  constructor(deleteNote: DeleteNoteUseCase) {
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
