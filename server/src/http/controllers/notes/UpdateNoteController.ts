import { type UpdateNoteBody } from '@nexus/shared';
import type { Request, Response } from 'express';

import type UpdateNoteUseCase from '../../../application/use-cases/notes/UpdateNoteUseCase';

export default class UpdateNoteUseCaseController {
  private updateNote: UpdateNoteUseCase;

  constructor(updateNote: UpdateNoteUseCase) {
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
