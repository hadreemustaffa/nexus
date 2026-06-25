import { NotFoundError } from '../../../domain/errors/NotFoundError';
import type NoteRepository from '../../../domain/repositories/NoteRepository';
import type SearchService from '../../../domain/services/SearchService';
import { LinkParser } from '../../ports/LinkParser';

export default class UpdateNoteUseCase {
  private noteRepository: NoteRepository;
  private searchService: SearchService;
  private linkParser: LinkParser;

  constructor(
    noteRepository: NoteRepository,
    searchService: SearchService,
    linkParser: LinkParser
  ) {
    this.noteRepository = noteRepository;
    this.searchService = searchService;
    this.linkParser = linkParser;
  }

  async execute(id: string, title: string, content: string) {
    const note = await this.noteRepository.findById(id);

    if (!note) {
      throw new NotFoundError('Note', id);
    }

    const isTitleChanged = note.getTitle() !== title;
    const isContentChanged = note.getContent() !== content;

    if (!isTitleChanged && !isContentChanged) {
      return { note };
    }

    if (isTitleChanged && !isContentChanged) {
      await this.searchService.deleteNote(note.getId(), note.getContent());
      note.update(title, content);
      await this.noteRepository.update(note);
      await this.searchService.indexNote(note.getId(), note.getContent());

      return { note };
    }

    // remove note from index, delete all wikilinks & delete tags
    await this.searchService.deleteNote(note.getId(), note.getContent());
    await this.noteRepository.deleteLink(id);

    note.update(title, content);

    // persist and re-index note
    await this.noteRepository.update(note);
    await this.searchService.indexNote(note.getId(), note.getContent());

    // re-parse links
    await this.linkParser.parse(note.getId(), note.getContent());

    return { note };
  }
}
