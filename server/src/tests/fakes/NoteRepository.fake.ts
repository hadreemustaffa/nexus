import Note from '../../domain/entities/Note';
import NoteRepository from '../../domain/repositories/NoteRepository';

export class FakeNoteRepository implements NoteRepository {
  private notes = new Map<string, Note>();
  private links = new Map<string, Set<string>>();

  async save(note: Note): Promise<void> {
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
    return Array.from(this.links.get(noteId) ?? []);
  }

  async saveLink(sourceId: string, targetId: string): Promise<void> {
    const existing = this.links.get(sourceId) ?? new Set<string>();
    existing.add(targetId);
    this.links.set(sourceId, existing);
  }

  async deleteLink(sourceId: string): Promise<void> {
    this.links.delete(sourceId);
  }

  async findByTitle(title: string): Promise<Note | null> {
    for (const note of this.notes.values()) {
      if (note.getTitle() === title) return note;
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
