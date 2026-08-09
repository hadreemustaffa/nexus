import Note from '../../../domain/entities/Note';
import { ValidationError } from '../../../domain/errors/ValidationError';
import NoteRepository from '../../../domain/repositories/NoteRepository';
import JobDispatcher from '../../jobs/JobDispatcher';
import { LinkParser } from '../../ports/LinkParser';
import Logger from '../../ports/Logger';

export default class CreateNoteUseCase {
  private noteRepository: NoteRepository;
  private dispatcher: JobDispatcher<'GENERATE_TAGS'>;
  private linkParser: LinkParser;
  private logger: Logger;

  constructor(
    noteRepository: NoteRepository,
    dispatcher: JobDispatcher<'GENERATE_TAGS'>,
    linkParser: LinkParser,
    logger: Logger
  ) {
    this.noteRepository = noteRepository;
    this.dispatcher = dispatcher;
    this.linkParser = linkParser;
    this.logger = logger;
  }

  async execute(title: string, content: string) {
    const existing = await this.noteRepository.findByTitle(title);

    if (existing) {
      throw new ValidationError('Duplicate title', [
        {
          field: 'title',
          message:
            'A note with this title already exists. Choose a different title.',
        },
      ]);
    }

    const note = Note.create(title, content);

    await this.noteRepository.save(note);

    await this.linkParser.parse(note.getId(), note.getContent());

    await this.dispatcher.dispatch({
      noteId: note.getId(),
      content: note.getContent(),
    });

    this.logger.info({ noteId: note.getId() }, 'Job dispatched for note');

    return {
      note,
    };
  }
}
