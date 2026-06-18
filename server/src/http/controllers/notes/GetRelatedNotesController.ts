import type { Request, Response } from 'express';

import type GetRelatedNotesUseCase from '../../../application/use-cases/notes/GetRelatedNotesUseCase';

export default class GetRelatedNotesUseCaseController {
  private getRelatedNotes: GetRelatedNotesUseCase;

  constructor(getRelatedNotes: GetRelatedNotesUseCase) {
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
