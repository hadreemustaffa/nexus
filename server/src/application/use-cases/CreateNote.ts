import Note from '../../domain/entities/Note';
import type NoteRepository from '../../domain/repositories/NoteRepository';
import type JobDispatcher from '../jobs/JobDispatcher';
import ParseAndSaveLinks from './ParseAndSaveLinks';

export default class CreateNote {
  private noteRepository: NoteRepository;
  private dispatcher: JobDispatcher<'GENERATE_TAGS'>;

  constructor(
    noteRepository: NoteRepository,
    dispatcher: JobDispatcher<'GENERATE_TAGS'>
  ) {
    this.noteRepository = noteRepository;
    this.dispatcher = dispatcher;
  }

  async execute(title: string, content: string) {
    const note = Note.create(title, content);

    await this.noteRepository.save(note);

    const parseAndSaveLinks = new ParseAndSaveLinks(this.noteRepository);
    await parseAndSaveLinks.execute(note.getId(), note.getContent());

    await this.dispatcher.dispatch({
      noteId: note.getId(),
      content: note.getContent(),
    });

    console.log('Job dispatched for note:', note.getId());

    return {
      note,
    };
  }
}
