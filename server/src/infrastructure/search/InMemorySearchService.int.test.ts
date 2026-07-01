import InMemorySearchService from './InMemorySearchService';

describe('InMemorySearchService', () => {
  let searchService: InMemorySearchService;

  beforeEach(() => {
    searchService = new InMemorySearchService();
  });

  describe('indexNote', () => {
    it('tokenizes and adds to the index', async () => {
      await searchService.indexNote('note-1', 'typescript language');

      const results = await searchService.search('typescript');

      expect(results).toEqual([
        { noteId: 'note-1', score: expect.any(Number) },
      ]);
    });
  });

  describe('search', () => {
    it('sums frequency scores across all matching tokens, sorted descending by score', async () => {
      await searchService.indexNote('note-a', 'typescript typescript language');
      await searchService.indexNote('note-b', 'typescript');

      const results = await searchService.search('typescript language');

      expect(results).toEqual([
        { noteId: 'note-a', score: 3 }, // 2 (typescript) + 1 (language)
        { noteId: 'note-b', score: 1 }, // 1 (typescript) only
      ]);
    });
  });

  describe('deleteNote', () => {
    it("removes note's tokens from the index", async () => {
      await searchService.indexNote('note-1', 'typescript');
      expect(await searchService.search('typescript')).toHaveLength(1);

      await searchService.deleteNote('note-1', 'typescript');

      expect(await searchService.search('typescript')).toEqual([]);
    });
  });
});
