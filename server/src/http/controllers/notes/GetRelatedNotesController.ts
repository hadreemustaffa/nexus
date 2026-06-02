import type { Request, Response } from 'express';

import GetRelatedNotes from '../../../application/use-cases/GetRelatedNotes';

export default class GetRelatedNotesController {
  private getRelatedNotes: GetRelatedNotes;

  constructor(getRelatedNotes: GetRelatedNotes) {
    this.getRelatedNotes = getRelatedNotes;
  }

  handle = async (req: Request, res: Response) => {
    const relatedNoteId = req.params.id as string;

    const relatedNotes = await this.getRelatedNotes.execute(relatedNoteId);

    if (relatedNotes.length === 0) {
      return res.status(200).json({
        message: 'Success, but no notes found.',
        data: [],
      });
    }

    return res.status(200).json({
      message: 'Found related notes.',
      data: relatedNotes,
    });
  };
}
