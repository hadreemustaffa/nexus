import { NotFoundError } from '../../../domain/errors/NotFoundError';
import type NoteRepository from '../../../domain/repositories/NoteRepository';
import type TagRepository from '../../../domain/repositories/TagRepository';
import type JobDispatcher from '../../jobs/JobDispatcher';

export default class RegenerateNoteTagsUseCase {
  private noteRepository: NoteRepository;
  private tagRepository: TagRepository;
  private dispatcher: JobDispatcher<'GENERATE_TAGS'>;

  constructor(
    noteRepository: NoteRepository,
    tagRepository: TagRepository,
    dispatcher: JobDispatcher<'GENERATE_TAGS'>
  ) {
    this.noteRepository = noteRepository;
    this.tagRepository = tagRepository;
    this.dispatcher = dispatcher;
  }

  async execute(id: string) {
    const note = await this.noteRepository.findById(id);

    if (!note) {
      throw new NotFoundError('Note', id);
    }

    await this.tagRepository.deleteByNoteId(note.getId());

    await this.dispatcher.dispatch({
      noteId: note.getId(),
      content: note.getContent(),
    });
  }
}
