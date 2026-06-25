import type Note from '../../../domain/entities/Note';
import type Tag from '../../../domain/entities/Tag';
import type NoteRepository from '../../../domain/repositories/NoteRepository';
import type TagRepository from '../../../domain/repositories/TagRepository';
import type SearchService from '../../../domain/services/SearchService';

export type NoteWithTags = {
  note: Note;
  tags: Tag[];
};

export default class SearchNotesUseCase {
  private noteRepository: NoteRepository;
  private tagRepository: TagRepository;
  private searchService: SearchService;

  constructor(
    noteRepository: NoteRepository,
    tagRepository: TagRepository,
    searchService: SearchService
  ) {
    this.noteRepository = noteRepository;
    this.tagRepository = tagRepository;
    this.searchService = searchService;
  }

  async execute(query: string): Promise<NoteWithTags[]> {
    const searchResults = await this.searchService.search(query);

    const results = await Promise.all(
      searchResults.map(async (res) => {
        const note = await this.noteRepository.findById(res.noteId);

        if (!note) return null;

        const tags = await this.tagRepository.findAllByNoteId(res.noteId);

        return { note, tags };
      })
    );

    return results.filter((r): r is NoteWithTags => r !== null);
  }
}
