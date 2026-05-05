export type SearchResult = {
  noteId: string;
  score: number;
};

export default interface SearchService {
  indexNote(noteId: string, content: string): Promise<void>;
  search(query: string): Promise<SearchResult[]>;
  deleteNote(noteId: string, content: string): Promise<void>;
}
