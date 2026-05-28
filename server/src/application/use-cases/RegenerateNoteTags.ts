import type NoteRepository from '../../domain/repositories/NoteRepository';
import type TagRepository from '../../domain/repositories/TagRepository';
import type Dispatcher from '../../infrastructure/queues/Dispatcher';

export default class RegenerateNoteTags {
  private noteRepository: NoteRepository;
  private tagRepository: TagRepository;
  private dispatcher: Dispatcher<'GENERATE_TAGS'>;

  constructor(
    noteRepository: NoteRepository,
    tagRepository: TagRepository,
    dispatcher: Dispatcher<'GENERATE_TAGS'>
  ) {
    this.noteRepository = noteRepository;
    this.tagRepository = tagRepository;
    this.dispatcher = dispatcher;
  }

  async execute(id: string) {
    const note = await this.noteRepository.findById(id);

    if (!note) {
      throw new Error('Note not found.');
    }

    await this.tagRepository.deleteByNoteId(note.getId());

    await this.dispatcher.dispatch({
      noteId: note.getId(),
      content: note.getContent(),
    });
  }
}
