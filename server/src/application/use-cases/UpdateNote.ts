import type NoteRepository from '../../domain/repositories/NoteRepository';
import type TagRepository from '../../domain/repositories/TagRepository';
import type SearchService from '../../domain/services/SearchService';
import type Dispatcher from '../../infrastructure/queues/Dispatcher';
import ParseAndSaveLinks from './ParseAndSaveLinks';

export default class UpdateNote {
  private noteRepository: NoteRepository;
  private tagRepository: TagRepository;
  private searchService: SearchService;
  private dispatcher: Dispatcher<'GENERATE_TAGS'>;

  constructor(
    noteRepository: NoteRepository,
    tagRepository: TagRepository,
    searchService: SearchService,
    dispatcher: Dispatcher<'GENERATE_TAGS'>
  ) {
    this.noteRepository = noteRepository;
    this.tagRepository = tagRepository;
    this.searchService = searchService;
    this.dispatcher = dispatcher;
  }

  async execute(id: string, title: string, content: string) {
    const note = await this.noteRepository.findById(id);

    if (!note) {
      throw new Error('No note found.');
    }

    // remove note from index, delete all wikilinks & delete tags
    await this.searchService.deleteNote(note.getId(), note.getContent());
    await this.noteRepository.deleteLink(id);
    await this.tagRepository.deleteByNoteId(id);

    note.update(title, content);

    // persist and re-index note
    await this.noteRepository.update(note);
    await this.searchService.indexNote(note.getId(), note.getContent());

    // re-parse links
    const parseAndSaveLinks = new ParseAndSaveLinks(this.noteRepository);
    await parseAndSaveLinks.execute(note.getId(), note.getContent());

    // re-generate tags since content might change significantly
    await this.dispatcher.dispatch({
      noteId: note.getId(),
      content: note.getContent(),
    });

    return { note };
  }
}
