import type Database from 'better-sqlite3';

import Prompt from '../../domain/entities/Prompt';
import type PromptRepository from '../../domain/repositories/PromptRepository';

type PromptRow = {
  id: string;
  key: string;
  content: string;
  version: number;
  is_default: number;
  is_active: number;
  created_at: string;
};

export default class SQLitePromptRepository implements PromptRepository {
  private db: Database.Database;

  constructor(db: Database.Database) {
    this.db = db;
  }

  async save(prompt: Prompt): Promise<void> {
    const stmt = this.db.prepare(`
        INSERT INTO prompts (
        id,
        key,
        content,
        version,
        is_default,
        is_active,
        created_at
        )
        VALUES (@id, @key, @content, @version, @is_default, @is_active, @created_at)
      `);

    stmt.run({
      id: prompt.id,
      key: prompt.key,
      content: prompt.content,
      version: prompt.version,
      is_default: prompt.isDefault ? 1 : 0,
      is_active: prompt.isActive ? 1 : 0,
      created_at: prompt.createdAt.toISOString(),
    });
  }

  async findById(id: string): Promise<Prompt | null> {
    const stmt = this.db.prepare(`
        SELECT * FROM prompts WHERE id = ?
      `);

    const row = stmt.get(id) as PromptRow | undefined;

    if (!row) return null;

    return Prompt.fromPersistence({
      id: row.id,
      key: row.key,
      content: row.content,
      version: row.version,
      isDefault: row.is_default === 1,
      isActive: row.is_active === 1,
      createdAt: new Date(row.created_at),
    });
  }

  async findAll(): Promise<Prompt[]> {
    const stmt = this.db.prepare(`
        SELECT * FROM prompts
      `);

    const rows = stmt.all() as PromptRow[];

    return rows.map((row) =>
      Prompt.fromPersistence({
        id: row.id,
        key: row.key,
        content: row.content,
        version: row.version,
        isDefault: row.is_default === 1,
        isActive: row.is_active === 1,
        createdAt: new Date(row.created_at),
      })
    );
  }

  async findByKey(key: string): Promise<Prompt[]> {
    const stmt = this.db.prepare(`
        SELECT * FROM prompts 
        WHERE key = @key
      `);

    const rows = stmt.all({ key }) as PromptRow[];

    if (!rows.length) return [];

    return rows.map((row) =>
      Prompt.fromPersistence({
        id: row.id,
        key: row.key,
        content: row.content,
        version: row.version,
        isDefault: row.is_default === 1,
        isActive: row.is_active === 1,
        createdAt: new Date(row.created_at),
      })
    );
  }

  async findActiveByKey(key: string): Promise<Prompt | null> {
    const stmt = this.db.prepare(`
        SELECT * FROM prompts 
        WHERE key = @key AND is_active = 1
      `);

    const rows = stmt.get({ key }) as PromptRow;

    if (!rows) {
      throw new Error(`No active prompt found for key "${key}"`);
    }

    return Prompt.fromPersistence({
      id: rows.id,
      key: rows.key,
      content: rows.content,
      version: rows.version,
      isDefault: rows.is_default === 1,
      isActive: rows.is_active === 1,
      createdAt: new Date(rows.created_at),
    });
  }

  async setActive(id: string): Promise<void> {
    const findStmt = this.db.prepare(`
    SELECT key
    FROM prompts
    WHERE id = ?
  `);

    const deactivateStmt = this.db.prepare(`
    UPDATE prompts
    SET is_active = 0
    WHERE key = ?
  `);

    const activateStmt = this.db.prepare(`
    UPDATE prompts
    SET is_active = 1
    WHERE id = ?
  `);

    const transaction = this.db.transaction((promptId: string) => {
      const row = findStmt.get(promptId) as { key: string } | undefined;

      if (!row) {
        throw new Error(`Prompt not found: ${promptId}`);
      }

      deactivateStmt.run(row.key);
      activateStmt.run(promptId);
    });

    transaction(id);
  }

  async delete(id: string): Promise<void> {
    const stmt = this.db.prepare(`
        DELETE FROM prompts
        WHERE id = @id
      `);

    stmt.run({
      id: id,
    });
  }
}
