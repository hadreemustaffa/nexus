import Database from 'better-sqlite3';
import Note from '../../domain/entities/Note';
import NoteRepository from '../../domain/repositories/NoteRepository';

type NoteRow = {
  id: string;
  title: string;
  content: string;
  created_at: string; // SQLite returns dates as strings, not Date objects
  updated_at: string;
};

export default class SQLiteNoteRepository implements NoteRepository {
  constructor(private db: Database.Database) {}

  async save(note: Note): Promise<void> {
    const stmt = this.db.prepare(`
        INSERT INTO notes (
        id,
        title,
        content,
        created_at,
        updated_at
        )
        VALUES (@id, @title, @content, @created_at, @updated_at)
      `);

    stmt.run({
      id: note.getId(),
      title: note.getTitle(),
      content: note.getContent(),
      created_at: note.getCreatedAt().toISOString(),
      updated_at: note.getUpdatedAt()?.toISOString() ?? null,
    });
  }

  async findById(id: string): Promise<Note | null> {
    const stmt = this.db.prepare(`
        SELECT * FROM notes WHERE id = ?
      `);

    const row = stmt.get(id) as NoteRow | undefined;

    if (!row) return null;

    return Note.fromPersistence({
      id: row.id,
      title: row.title,
      content: row.content,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    });
  }

  async findAll(): Promise<Note[]> {
    const stmt = this.db.prepare(`
        SELECT * FROM notes
      `);

    const rows = stmt.all() as NoteRow[];

    return rows.map((row) =>
      Note.fromPersistence({
        id: row.id,
        title: row.title,
        content: row.content,
        created_at: new Date(row.created_at),
        updated_at: new Date(row.updated_at),
      })
    );
  }

  async update(note: Note): Promise<void> {
    const stmt = this.db.prepare(`
        UPDATE notes 
        SET title = @title, content = @content, updated_at = @updated_at
        WHERE id = @id 
      `);

    stmt.run({
      id: note.getId(),
      title: note.getTitle(),
      content: note.getContent(),
      updated_at: note.getUpdatedAt().toISOString(),
    });
  }

  async delete(id: string): Promise<void> {
    const stmt = this.db.prepare(`
        DELETE FROM notes
        WHERE id = @id
      `);

    stmt.run({
      id: id,
    });
  }
}
