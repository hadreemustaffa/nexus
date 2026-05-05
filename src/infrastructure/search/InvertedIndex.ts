type IndexEntry = {
  noteId: string;
  frequency: number;
};

type Index = Map<string, IndexEntry[]>;

export default class InvertedIndex {
  private index: Index;

  constructor() {
    this.index = new Map<string, IndexEntry[]>();
  }

  addNote(noteId: string, tokens: string[]): void {
    if (tokens) {
      tokens.forEach((token) => {
        if (!this.index.has(token)) {
          this.index.set(token, [{ noteId, frequency: 1 }]);
        } else {
          const indexedTokenWithId = this.index
            .get(token)
            ?.find((entry) => entry.noteId === noteId);

          if (indexedTokenWithId) {
            indexedTokenWithId.frequency += 1;
          } else {
            this.index.get(token)!.push({ noteId, frequency: 1 });
          }
        }
      });
    }
  }

  deleteNote(noteId: string, tokens: string[]): void {
    if (tokens) {
      tokens.forEach((token) => {
        if (this.index.has(token)) {
          const filtered = this.index
            .get(token)!
            .filter((entry) => entry.noteId !== noteId);

          this.index.set(token, filtered);
        }
      });
    }
  }

  search(token: string): IndexEntry[] {
    return this.index.get(token) ?? [];
  }
}
