import type { Request, Response } from 'express';

import GetRelatedNotes from '../../../application/use-cases/GetRelatedNotes';
import type NoteRepository from '../../../domain/repositories/NoteRepository';

export default class GetRelatedNotesController {
  private getRelatedNotes: GetRelatedNotes;
  private noteRepository: NoteRepository;

  constructor(
    getRelatedNotes: GetRelatedNotes,
    noteRepository: NoteRepository
  ) {
    this.getRelatedNotes = getRelatedNotes;
    this.noteRepository = noteRepository;
  }

  async handle(req: Request, res: Response): Promise<Response> {
    try {
      const relatedNoteId = req.params.id as string;

      const note = await this.noteRepository.findById(relatedNoteId);

      if (!note) {
        return res
          .status(404)
          .json({ error: 'Not Found', message: 'Note not found' });
      }

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
