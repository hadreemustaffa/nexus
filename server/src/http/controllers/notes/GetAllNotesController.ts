import type { Request, Response } from 'express';

import type GetAllNotes from '../../../application/use-cases/GetAllNotes';

export default class GetAllNotesController {
  private getAllNotes: GetAllNotes;

  constructor(getAllNotes: GetAllNotes) {
    this.getAllNotes = getAllNotes;
  }

  handle = async (req: Request, res: Response): Promise<Response> => {
    try {
      const notes = await this.getAllNotes.execute();

      if (notes.length === 0) {
        return res.status(200).json({
          message: 'Success, but no notes found.',
          data: [],
        });
      }

      return res.status(200).json({
        message: 'Found notes.',
        data: { notes },
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
