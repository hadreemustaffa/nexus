import Database from 'better-sqlite3';
import TagRepository from '../../domain/repositories/TagRepository';
import Tag from '../../domain/entities/Tag';

type TagRow = {
  id: string;
  name: string;
  created_at: string;
};

export default class SQLiteTagRepository implements TagRepository {
  constructor(private db: Database.Database) {}

  async save(tag: Tag): Promise<void> {
    const stmt = this.db.prepare(`
        INSERT INTO tags (
        id,
        name,
        created_at
        )
        VALUES (@id, @name, @created_at)
      `);

    stmt.run({
      id: tag.getId(),
      name: tag.getName(),
      created_at: tag.getCreatedAt().toISOString(),
    });
  }

  async findById(id: string): Promise<Tag | null> {
    const stmt = this.db.prepare(`
        SELECT * FROM tags
        WHERE id = @id
      `);

    const row = stmt.get({ id }) as TagRow | undefined;

    if (!row) return null;

    return Tag.fromPersistence({
      id: row.id,
      name: row.name,
      created_at: new Date(row.created_at),
    });
  }

  async findAll(): Promise<Tag[]> {
    const stmt = this.db.prepare(`
          SELECT * FROM tags
        `);

    const rows = stmt.all() as TagRow[];

    return rows.map((row) =>
      Tag.fromPersistence({
        id: row.id,
        name: row.name,
        created_at: new Date(row.created_at),
      })
    );
  }

  async findAllByNoteId(noteId: string): Promise<Tag[]> {
    const stmt = this.db.prepare(`
        SELECT tags.* FROM tags
        INNER JOIN note_tags ON tags.id = note_tags.tag_id
        WHERE note_tags.note_id = @noteId
      `);

    const rows = stmt.all({ noteId }) as TagRow[];

    return rows.map((row) =>
      Tag.fromPersistence({
        id: row.id,
        name: row.name,
        created_at: new Date(row.created_at),
      })
    );
  }

  async attachTagToNote(noteId: string, tagId: string): Promise<void> {
    const stmt = this.db.prepare(`
        INSERT OR IGNORE INTO note_tags (
        note_id, 
        tag_id
        ) 
        VALUES (@noteId, @tagId)
      `);

    stmt.run({ noteId, tagId });
  }

  async findByName(name: string): Promise<Tag | null> {
    const stmt = this.db.prepare(`
        SELECT * FROM tags 
        WHERE LOWER(name) = LOWER(@name)
      `);

    const row = stmt.get({ name }) as TagRow | undefined;

    if (!row) return null;

    return Tag.fromPersistence({
      id: row.id,
      name: row.name,
      created_at: new Date(row.created_at),
    });
  }

  async deleteByNoteId(noteId: string): Promise<void> {
    const stmt = this.db.prepare(`
        DELETE FROM note_tags 
        WHERE note_id = @noteId
      `);

    stmt.run({ noteId });
  }
}
