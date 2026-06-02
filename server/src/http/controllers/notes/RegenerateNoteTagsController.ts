import type { Request, Response } from 'express';

import type RegenerateNoteTags from '../../../application/use-cases/RegenerateNoteTags';

export default class RegenerateNoteTagsController {
  private regenerateNoteTags: RegenerateNoteTags;

  constructor(regenerateNoteTags: RegenerateNoteTags) {
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
