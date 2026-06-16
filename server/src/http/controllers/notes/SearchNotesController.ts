import { type SearchQuery } from '@nexus/shared';
import type { Request, Response } from 'express';

import type SearchNotes from '../../../application/use-cases/SearchNotes';

export default class SearchNotesController {
  private searchNotes: SearchNotes;

  constructor(searchNotes: SearchNotes) {
    this.searchNotes = searchNotes;
  }

  handle = async (_req: Request, res: Response) => {
    const { q } = res.locals.query as SearchQuery;

    const results = await this.searchNotes.execute(q);

    return res.status(200).json({
      message: 'Search found some notes.',
      data: results,
    });
  };
}
