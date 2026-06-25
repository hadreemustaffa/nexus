import InvertedIndex from './InvertedIndex';

describe('InvertedIndex', () => {
  let index: InvertedIndex;

  beforeEach(() => {
    index = new InvertedIndex();
  });

  describe('addNote', () => {
    it('creates a new entry for an unseen token', () => {
      index.addNote('note-1', ['react']);

      expect(index.search('react')).toStrictEqual([
        { noteId: 'note-1', frequency: 1 },
      ]);
    });

    it('increments frequency on a repeated token for the same note', () => {
      index.addNote('note-1', ['react', 'react', 'hooks']);

      expect(index.search('react')).toStrictEqual([
        { noteId: 'note-1', frequency: 2 },
      ]);
      expect(index.search('hooks')).toStrictEqual([
        { noteId: 'note-1', frequency: 1 },
      ]);
    });

    it("adds a second note to an existing token without disturbing the first note's frequency", () => {
      index.addNote('note-1', ['react', 'react']);
      index.addNote('note-2', ['react']);

      expect(index.search('react')).toStrictEqual([
        { noteId: 'note-1', frequency: 2 },
        { noteId: 'note-2', frequency: 1 },
      ]);
    });
  });

  describe('deleteNote', () => {
    it("removes only the matching note, leaving other notes' entries intact", () => {
      index.addNote('note-1', ['react', 'react']);
      index.addNote('note-2', ['react', 'hooks']);

      index.deleteNote('note-1', ['react', 'react']);

      expect(index.search('react')).toStrictEqual([
        { noteId: 'note-2', frequency: 1 },
      ]);
      expect(index.search('hooks')).toStrictEqual([
        { noteId: 'note-2', frequency: 1 },
      ]);
    });
  });

  describe('search', () => {
    it('returns the correct results for an indexed token', () => {
      index.addNote('note-1', ['typescript', 'react']);
      index.addNote('note-2', ['typescript', 'python', 'typescript']);
      index.addNote('note-3', ['pineapple', 'pizza']);

      expect(index.search('typescript')).toStrictEqual([
        { noteId: 'note-2', frequency: 2 },
        { noteId: 'note-1', frequency: 1 },
      ]);
    });

    it('returns [] for an unindexed token', () => {
      expect(index.search('typescript')).toStrictEqual([]);
    });
  });
});
