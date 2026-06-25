type NoteFrequencyMap = Map<string, number>;
type Index = Map<string, NoteFrequencyMap>;

export type IndexEntry = {
  noteId: string;
  frequency: number;
};

export default class InvertedIndex {
  private readonly index: Index;

  constructor() {
    this.index = new Map();
  }

  addNote(noteId: string, tokens: string[]): void {
    for (const token of tokens) {
      let noteFrequencies = this.index.get(token);

      if (!noteFrequencies) {
        noteFrequencies = new Map();
        this.index.set(token, noteFrequencies);
      }

      noteFrequencies.set(noteId, (noteFrequencies.get(noteId) ?? 0) + 1);
    }
  }

  deleteNote(noteId: string, tokens: string[]): void {
    const uniqueTokens = new Set(tokens);

    for (const token of uniqueTokens) {
      const noteFrequencies = this.index.get(token);
      if (!noteFrequencies) continue;

      noteFrequencies.delete(noteId);

      if (noteFrequencies.size === 0) {
        this.index.delete(token);
      }
    }
  }

  search(token: string): IndexEntry[] {
    const noteFrequencies = this.index.get(token);

    if (!noteFrequencies) return [];

    return Array.from(noteFrequencies.entries(), ([noteId, frequency]) => ({
      noteId,
      frequency,
    })).sort((a, b) => b.frequency - a.frequency);
  }
}
