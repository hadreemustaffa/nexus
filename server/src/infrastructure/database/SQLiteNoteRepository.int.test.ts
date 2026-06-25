import { NOTE_WORD_MIN } from '@nexus/shared';
import Database from 'better-sqlite3';

import { NoteFactory } from '../../tests/factories/Note.factory';
import initDatabase from './init';
import SQLiteNoteRepository from './SQLiteNoteRepository';

describe('SQLiteNoteRepository', () => {
  let db: Database.Database;
  let repository: SQLiteNoteRepository;
  let content: string;

  beforeEach(() => {
    db = new Database(':memory:');
    initDatabase(db);
    repository = new SQLiteNoteRepository(db);

    content = Array(NOTE_WORD_MIN).fill('word').join(' ');
  });

  afterEach(() => {
    db.close();
  });

  describe('save + findById', () => {
    it('performs successful round-trip', async () => {
      const note = NoteFactory.build();

      await repository.save(note);

      const result = await repository.findById(note.getId());

      expect(result).not.toBeNull();
      expect(result?.getId()).toBe(note.getId());
      expect(result?.getTitle()).toBe(note.getTitle());
      expect(result?.getContent()).toBe(note.getContent());
      expect(result?.getCreatedAt()).toEqual(note.getCreatedAt());
      expect(result?.getUpdatedAt()).toEqual(note.getUpdatedAt());
    });

    it('returns null when note does not exist', async () => {
      const result = await repository.findById('missing-id');

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('returns all saved notes', async () => {
      const noteA = NoteFactory.build({ title: 'Note A' });
      const noteB = NoteFactory.build({ title: 'Note B' });

      await repository.save(noteA);
      await repository.save(noteB);

      const result = await repository.findAll();

      expect(result).toHaveLength(2);
      expect(result.map((note) => note.getId())).toEqual([
        noteA.getId(),
        noteB.getId(),
      ]);
    });
  });

  describe('update', () => {
    it('persists new title, content, and updatedAt', async () => {
      const note = NoteFactory.build({ title: 'Old title' });
      await repository.save(note);

      note.update('New title', `${content} updated`);

      await repository.update(note);

      const result = await repository.findById(note.getId());

      expect(result).not.toBeNull();
      expect(result?.getTitle()).toBe('New title');
      expect(result?.getContent()).toBe(`${content} updated`);
      expect(result?.getUpdatedAt()).toEqual(note.getUpdatedAt());
    });
  });

  describe('delete', () => {
    it('removes the row', async () => {
      const note = NoteFactory.build();
      await repository.save(note);

      await repository.delete(note.getId());

      const result = await repository.findById(note.getId());

      expect(result).toBeNull();
    });
  });

  describe('findByTitle', () => {
    it('matches case-insensitively', async () => {
      const note = NoteFactory.build({ title: 'Test Title' });
      await repository.save(note);

      const result = await repository.findByTitle('test title');

      expect(result).not.toBeNull();
      expect(result?.getId()).toBe(note.getId());
    });

    it('returns null when no matching title exists', async () => {
      const result = await repository.findByTitle('missing title');

      expect(result).toBeNull();
    });
  });

  describe('findLinks', () => {
    it(' returns an empty array when note has no links', async () => {
      const note = NoteFactory.build();
      await repository.save(note);

      const links = await repository.findLinks(note.getId());

      expect(links).toEqual([]);
    });
  });

  it('saveLink + findLinks + deleteLink round-trip correctly', async () => {
    const source = NoteFactory.build();
    const targetA = NoteFactory.build();
    const targetB = NoteFactory.build();

    await repository.save(source);
    await repository.save(targetA);
    await repository.save(targetB);

    await repository.saveLink(source.getId(), targetA.getId());
    await repository.saveLink(source.getId(), targetB.getId());

    const linksBeforeDelete = await repository.findLinks(source.getId());

    expect(linksBeforeDelete).toHaveLength(2);
    expect(linksBeforeDelete).toEqual(
      expect.arrayContaining([(targetA.getId(), targetB.getId())])
    );

    await repository.deleteLink(source.getId());

    const linksAfterDelete = await repository.findLinks(source.getId());

    expect(linksAfterDelete).toEqual([]);
  });
});
