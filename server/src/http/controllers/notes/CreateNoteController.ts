import type { Request, Response } from 'express';

import CreateNote from '../../../application/use-cases/CreateNote';

export default class CreateNoteController {
  private createNote: CreateNote;

  constructor(createNote: CreateNote) {
    this.createNote = createNote;
  }

  handle = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { title, content } = req.body;

      const result = await this.createNote.execute(title, content);

      return res.status(201).json({
        message: 'Note created successfully.',
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
