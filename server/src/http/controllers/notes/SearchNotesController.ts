import { type SearchQuery } from '@nexus/shared';
import type { Request, Response } from 'express';

import type SearchNotesUseCase from '../../../application/use-cases/notes/SearchNotesUseCase';

export default class SearchNotesUseCaseController {
  private searchNotes: SearchNotesUseCase;

  constructor(searchNotes: SearchNotesUseCase) {
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
