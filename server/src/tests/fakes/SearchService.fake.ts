import SearchService, {
  SearchResult,
} from '../../domain/services/SearchService';

type IndexedNote = {
  noteId: string;
  content: string;
};

export class FakeSearchService implements SearchService {
  public indexedNotes: IndexedNote[] = [];
  public deletedNotes: IndexedNote[] = [];
  public searchedQueries: string[] = [];

  private searchResults: SearchResult[] = [];

  async indexNote(noteId: string, content: string): Promise<void> {
    this.indexedNotes.push({ noteId, content });
  }

  async search(query: string): Promise<SearchResult[]> {
    this.searchedQueries.push(query);
    return this.searchResults;
  }

  async deleteNote(noteId: string, content: string): Promise<void> {
    this.deletedNotes.push({ noteId, content });

    this.indexedNotes = this.indexedNotes.filter(
      (note) => note.noteId !== noteId
    );
  }

  setSearchResults(results: SearchResult[]): void {
    this.searchResults = results;
  }

  clearSearchResults(): void {
    this.searchResults = [];
  }

  isIndexed(noteId: string): boolean {
    return this.indexedNotes.some((note) => note.noteId === noteId);
  }

  isDeleted(noteId: string): boolean {
    return this.deletedNotes.some((note) => note.noteId === noteId);
  }
}
