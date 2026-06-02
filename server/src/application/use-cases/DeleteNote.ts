import { NotFoundError } from '../../domain/errors/NotFoundError';
import type NoteRepository from '../../domain/repositories/NoteRepository';
import type SearchService from '../../domain/services/SearchService';

export default class DeleteNote {
  private noteRepository: NoteRepository;
  private searchService: SearchService;

  constructor(noteRepository: NoteRepository, searchService: SearchService) {
    this.noteRepository = noteRepository;
    this.searchService = searchService;
  }

  async execute(id: string) {
    const note = await this.noteRepository.findById(id);

    if (!note) {
      throw new NotFoundError('Note', id);
    }

    await this.searchService.deleteNote(note.getId(), note.getContent());
    await this.noteRepository.delete(id);
  }
}
