import { NotFoundError } from '../../domain/errors/NotFoundError';
import type NoteRepository from '../../domain/repositories/NoteRepository';
import type TagRepository from '../../domain/repositories/TagRepository';

export default class GetSingleNote {
  private noteRepository: NoteRepository;
  private tagRepository: TagRepository;

  constructor(noteRepository: NoteRepository, tagRepository: TagRepository) {
    this.noteRepository = noteRepository;
    this.tagRepository = tagRepository;
  }

  async execute(id: string) {
    const note = await this.noteRepository.findById(id);

    if (!note) {
      throw new NotFoundError('Note', id);
    }

    const tags = await this.tagRepository.findAllByNoteId(id);

    return { note, tags };
  }
}
