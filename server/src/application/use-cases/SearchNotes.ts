import Note from '../../domain/entities/Note';
import Tag from '../../domain/entities/Tag';
import NoteRepository from '../../domain/repositories/NoteRepository';
import TagRepository from '../../domain/repositories/TagRepository';
import SearchService from '../../domain/services/SearchService';

export type NoteWithTags = {
  note: Note;
  tags: Tag[];
};

export default class SearchNotes {
  constructor(
    private noteRepository: NoteRepository,
    private tagRepository: TagRepository,
    private searchService: SearchService
  ) {}

  async execute(query: string): Promise<NoteWithTags[]> {
    const searchResults = await this.searchService.search(query);

    const results = await Promise.all(
      searchResults.map(async (res) => {
        const note = await this.noteRepository.findById(res.noteId);
        const tags = await this.tagRepository.findAllByNoteId(res.noteId);
        return { note, tags };
      })
    );

    return results.filter((r): r is NoteWithTags => r !== null);
  }
}
