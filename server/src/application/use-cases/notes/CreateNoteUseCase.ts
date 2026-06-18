import Note from '../../../domain/entities/Note';
import NoteRepository from '../../../domain/repositories/NoteRepository';
import JobDispatcher from '../../jobs/JobDispatcher';
import ParseAndSaveLinksUseCase from './ParseAndSaveLinksUseCase';

export default class CreateNoteUseCase {
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

    const parseAndSaveLinks = new ParseAndSaveLinksUseCase(this.noteRepository);
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
