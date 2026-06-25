import Database from 'better-sqlite3';

import { NoteFactory } from '../../tests/factories/Note.factory';
import { TagFactory } from '../../tests/factories/Tag.factory';
import initDatabase from './init';
import SQLiteNoteRepository from './SQLiteNoteRepository';
import SQLiteTagRepository from './SQLiteTagRepository';

describe('SQLiteTagRepository', () => {
  let db: Database.Database;
  let noteRepository: SQLiteNoteRepository;
  let tagRepository: SQLiteTagRepository;

  beforeEach(() => {
    db = new Database(':memory:');
    initDatabase(db);
    noteRepository = new SQLiteNoteRepository(db);
    tagRepository = new SQLiteTagRepository(db);
  });

  afterEach(() => {
    db.close();
  });

  describe('save + findById', () => {
    it('performs successful round-trip', async () => {
      const tag = TagFactory.build();

      await tagRepository.save(tag);

      const result = await tagRepository.findById(tag.getId());

      expect(result).not.toBeNull();
      expect(result?.getId()).toBe(tag.getId());
      expect(result?.getName()).toBe(tag.getName());
      expect(result?.getCreatedAt()).toEqual(tag.getCreatedAt());
    });

    it('returns null for missing tag', async () => {
      const result = await tagRepository.findById('missing-id');

      expect(result).toBeNull();
    });

    it('throws when saving a tag with duplicate name', async () => {
      const tagA = TagFactory.build({ name: 'test' });
      const tagB = TagFactory.build({ name: 'Test' });

      await tagRepository.save(tagA);

      await expect(tagRepository.save(tagB)).rejects.toThrow();
    });
  });

  describe('findAll', () => {
    it('returns all tags', async () => {
      const tagA = TagFactory.build({ name: 'TagA' });
      const tagB = TagFactory.build({ name: 'TagB' });

      await tagRepository.save(tagA);
      await tagRepository.save(tagB);

      const result = await tagRepository.findAll();

      expect(result).toHaveLength(2);
      expect(result).toEqual(expect.arrayContaining([tagA, tagB]));
    });

    it('returns null for missing tag', async () => {
      const result = await tagRepository.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findAllByNoteId', () => {
    it('returns correct tags belonging to a note id', async () => {
      const note = NoteFactory.build();
      const tagA = TagFactory.build({ name: 'TagA' });
      const tagB = TagFactory.build({ name: 'TagB' });
      const tagC = TagFactory.build({ name: 'TagC' });

      await noteRepository.save(note);

      await tagRepository.save(tagA);
      await tagRepository.save(tagB);
      await tagRepository.save(tagC);

      await tagRepository.attachTagToNote(note.getId(), tagA.getId());
      await tagRepository.attachTagToNote(note.getId(), tagB.getId());

      const result = await tagRepository.findAllByNoteId(note.getId());

      expect(result).toHaveLength(2);
      expect(result).toEqual(expect.arrayContaining([tagA, tagB]));
      expect(result).not.toEqual(expect.arrayContaining([tagC]));
    });

    it('returns [] when the note has no tags', async () => {
      const note = NoteFactory.build();

      await noteRepository.save(note);

      const result = await tagRepository.findAllByNoteId(note.getId());

      expect(result).toEqual([]);
    });
  });

  describe('findByName', () => {
    it('returns the tag', async () => {
      const name = 'typescript';
      const tag = TagFactory.build({ name });

      await tagRepository.save(tag);

      const result = await tagRepository.findByName(name);

      expect(result).toEqual(tag);
    });

    it('returns null for missing tag', async () => {
      const result = await tagRepository.findByName('missing');

      expect(result).toBeNull();
    });
  });

  describe('attachTagToNote', () => {
    it('attaches a tag to a note', async () => {
      const note = NoteFactory.build();
      const tag = TagFactory.build();

      await noteRepository.save(note);
      await tagRepository.save(tag);

      await tagRepository.attachTagToNote(note.getId(), tag.getId());

      const result = await tagRepository.findAllByNoteId(note.getId());

      expect(result).toEqual([tag]);
    });

    it('does not create duplicate note-tag relation when called multiple times with the same note and tag', async () => {
      const note = NoteFactory.build();
      const tag = TagFactory.build();

      await noteRepository.save(note);
      await tagRepository.save(tag);

      await tagRepository.attachTagToNote(note.getId(), tag.getId());
      await tagRepository.attachTagToNote(note.getId(), tag.getId());

      const result = await tagRepository.findAllByNoteId(note.getId());

      expect(result).toHaveLength(1);
      expect(result).toEqual([tag]);
    });
  });

  describe('deleteByNoteId', () => {
    it('removes all tags relation for the given note only', async () => {
      const noteA = NoteFactory.build();
      const noteB = NoteFactory.build();
      const tagA = TagFactory.build({ name: 'TagA' });
      const tagB = TagFactory.build({ name: 'TagB' });

      await noteRepository.save(noteA);
      await noteRepository.save(noteB);
      await tagRepository.save(tagA);
      await tagRepository.save(tagB);

      await tagRepository.attachTagToNote(noteA.getId(), tagA.getId());
      await tagRepository.attachTagToNote(noteB.getId(), tagB.getId());

      await tagRepository.deleteByNoteId(noteA.getId());

      const noteATags = await tagRepository.findAllByNoteId(noteA.getId());
      const noteBTags = await tagRepository.findAllByNoteId(noteB.getId());

      expect(noteATags).toEqual([]);
      expect(noteBTags).toEqual([tagB]);
    });
  });
});
