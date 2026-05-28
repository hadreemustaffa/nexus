import type { Request, Response } from 'express';

import type RegenerateNoteTags from '../../../application/use-cases/RegenerateNoteTags';

export default class RegenerateNoteTagsController {
  private regenerateNoteTags: RegenerateNoteTags;

  constructor(regenerateNoteTags: RegenerateNoteTags) {
    this.regenerateNoteTags = regenerateNoteTags;
  }

  handle = async (req: Request, res: Response): Promise<Response> => {
    try {
      const noteId = req.params.id as string;

      await this.regenerateNoteTags.execute(noteId);

      return res.status(200).json({
        message: 'Note tags queued for generation successfully.',
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
