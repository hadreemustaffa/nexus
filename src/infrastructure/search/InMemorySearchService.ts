import InvertedIndex from './InvertedIndex';
import Tokenizer from './Tokenizer';
import SearchService, {
  SearchResult,
} from '../../domain/services/SearchService';

export default class InMemorySearchService implements SearchService {
  private index: InvertedIndex;
  private tokenizer: Tokenizer;

  constructor() {
    this.index = new InvertedIndex();
    this.tokenizer = new Tokenizer();
  }

  async indexNote(noteId: string, content: string): Promise<void> {
    const tokenizedContent = this.tokenizer.tokenize(content);

    return this.index.addNote(noteId, tokenizedContent);
  }

  async search(query: string): Promise<SearchResult[]> {
    const tokenizedQuery = this.tokenizer.tokenize(query);
    const scoreMap = new Map<string, number>();

    tokenizedQuery.forEach((token) => {
      const indexedEntry = this.index.search(token);

      if (indexedEntry.length > 0) {
        indexedEntry.forEach((entry) => {
          const currentScore = scoreMap.get(entry.noteId) ?? 0;
          scoreMap.set(entry.noteId, currentScore + entry.frequency);
        });
      }
    });

    const sortedScoreMap: SearchResult[] = Array.from(
      scoreMap,
      ([noteId, score]) => ({
        noteId,
        score,
      })
    ).sort((a, b) => b.score - a.score);

    return sortedScoreMap;
  }
}
