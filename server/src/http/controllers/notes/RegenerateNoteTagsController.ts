import type { Request, Response } from 'express';

import type RegenerateNoteTagsUseCase from '../../../application/use-cases/notes/RegenerateNoteTagsUseCase';

export default class RegenerateNoteTagsUseCaseController {
  private regenerateNoteTags: RegenerateNoteTagsUseCase;

  constructor(regenerateNoteTags: RegenerateNoteTagsUseCase) {
    this.regenerateNoteTags = regenerateNoteTags;
  }

  handle = async (req: Request, res: Response) => {
    const noteId = req.params.id as string;

    await this.regenerateNoteTags.execute(noteId);

    return res.status(200).json({
      message: 'Tag regeneration started.',
    });
  };
}
