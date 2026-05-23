import type { Request, Response } from 'express';

import SearchNotes from '../../../application/use-cases/SearchNotes';

export default class SearchNotesController {
  private searchNotes: SearchNotes;

  constructor(searchNotes: SearchNotes) {
    this.searchNotes = searchNotes;
  }

  async handle(req: Request, res: Response): Promise<Response> {
    try {
      const q = req.query.q as string;

      if (!q) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'query is required',
        });
      }

      const results = await this.searchNotes.execute(q);

      return res.status(200).json({
        message: 'Search found some notes.',
        data: results,
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
  }
}
