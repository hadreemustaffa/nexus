import Note from '../../../domain/entities/Note';
import NoteRepository from '../../../domain/repositories/NoteRepository';
import JobDispatcher from '../../jobs/JobDispatcher';
import { LinkParser } from '../../ports/LinkParser';

export default class CreateNoteUseCase {
  private noteRepository: NoteRepository;
  private dispatcher: JobDispatcher<'GENERATE_TAGS'>;
  private linkParser: LinkParser;

  constructor(
    noteRepository: NoteRepository,
    dispatcher: JobDispatcher<'GENERATE_TAGS'>,
    linkParser: LinkParser
  ) {
    this.noteRepository = noteRepository;
    this.dispatcher = dispatcher;
    this.linkParser = linkParser;
  }

  async execute(title: string, content: string) {
    const note = Note.create(title, content);

    await this.noteRepository.save(note);

    await this.linkParser.parse(note.getId(), note.getContent());

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
