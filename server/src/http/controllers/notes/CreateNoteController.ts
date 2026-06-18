import { type CreateNoteBody } from '@nexus/shared';
import type { Request, Response } from 'express';

import CreateNoteUseCase from '../../../application/use-cases/notes/CreateNoteUseCase';

export default class CreateNoteController {
  private createNote: CreateNoteUseCase;

  constructor(createNote: CreateNoteUseCase) {
    this.createNote = createNote;
  }

  handle = async (req: Request, res: Response) => {
    const { title, content } = req.body as CreateNoteBody;

    const result = await this.createNote.execute(title, content);

    return res.status(201).json({
      message: 'Note created successfully.',
      data: result,
    });
  };
}
