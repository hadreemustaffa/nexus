import type { Request, Response } from 'express';

import SearchNotes from '../../../application/use-cases/SearchNotes';
import { ValidationError } from '../../../domain/errors/ValidationError';

export default class SearchNotesController {
  private searchNotes: SearchNotes;

  constructor(searchNotes: SearchNotes) {
    this.searchNotes = searchNotes;
  }

  handle = async (req: Request, res: Response) => {
    const q = req.query.q as string | undefined;

    if (!q) {
      throw new ValidationError('Search query is required', [
        { field: 'q', message: 'query is required' },
      ]);
    }

    const results = await this.searchNotes.execute(q);

    return res.status(200).json({
      message: 'Search found some notes.',
      data: results,
    });
  };
}
