import Note from '../entities/Note';

export default interface NoteRepository {
  save(note: Note): Promise<void>;
  findById(id: string): Promise<Note | null>;
  findAll(): Promise<Note[]>;
  update(note: Note): Promise<void>;
  delete(id: string): Promise<void>;
  findLinks(noteId: string): Promise<string[]>; // returns neighbor IDs
  saveLink(sourceId: string, targetId: string): Promise<void>;
  deleteLink(sourceId: string): Promise<void>;
  findByTitle(title: string): Promise<Note | null>;
}
