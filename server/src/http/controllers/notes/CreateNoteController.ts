import type { Request, Response } from 'express';

import CreateNote from '../../../application/use-cases/CreateNote';

export default class CreateNoteController {
  private createNote: CreateNote;

  constructor(createNote: CreateNote) {
    this.createNote = createNote;
  }

  handle = async (req: Request, res: Response) => {
    const { title, content } = req.body;

    const result = await this.createNote.execute(title, content);

    return res.status(201).json({
      message: 'Note created successfully.',
      data: result,
    });
  };
}
