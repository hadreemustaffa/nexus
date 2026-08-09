import Note from '../../domain/entities/Note';
import NoteRepository from '../../domain/repositories/NoteRepository';

export class FakeNoteRepository implements NoteRepository {
  private notes = new Map<string, Note>();
  private links = new Map<string, Set<string>>();

  async save(note: Note): Promise<void> {
    const existing = await this.findByTitle(note.getTitle());

    if (existing) {
      throw new Error(`Duplicate title: ${note.getTitle()}`);
    }

    this.notes.set(note.id, note);
  }

  async findById(id: string): Promise<Note | null> {
    return this.notes.get(id) ?? null;
  }

  async findAll(): Promise<Note[]> {
    return Array.from(this.notes.values());
  }

  async update(note: Note): Promise<void> {
    if (!this.notes.has(note.id)) {
      throw new Error(`Note with id ${note.id} not found`);
    }

    this.notes.set(note.id, note);
  }

  async delete(id: string): Promise<void> {
    this.notes.delete(id);
    this.links.delete(id);

    for (const [, targets] of this.links) {
      targets.delete(id);
    }
  }

  async findLinks(noteId: string): Promise<string[]> {
    const titles = this.links.get(noteId) ?? new Set<string>();
    const resolvedIds: string[] = [];

    for (const title of titles) {
      const note = await this.findByTitle(title);
      if (note) {
        resolvedIds.push(note.getId());
      }
    }

    return resolvedIds;
  }

  async saveLink(sourceId: string, targetTitle: string): Promise<void> {
    const normalizedTitle = Note.normalizeTitle(targetTitle);
    const existing = this.links.get(sourceId) ?? new Set<string>();
    existing.add(normalizedTitle);
    this.links.set(sourceId, existing);
  }

  async deleteLink(sourceId: string): Promise<void> {
    this.links.delete(sourceId);
  }

  async findByTitle(title: string): Promise<Note | null> {
    const normalizedTitle = Note.normalizeTitle(title);

    for (const note of this.notes.values()) {
      if (Note.normalizeTitle(note.getTitle()) === normalizedTitle) return note;
    }
    return null;
  }

  seed(notes: Note[]): void {
    for (const note of notes) {
      this.notes.set(note.id, note);
    }
  }

  clear(): void {
    this.notes.clear();
    this.links.clear();
  }
}
