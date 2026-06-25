import Database from 'better-sqlite3';

import { PromptFactory } from '../../tests/factories/Prompt.factory';
import initDatabase from './init';
import SQLitePromptRepository from './SQLitePromptRepository';

describe('SQLitePromptRepository', () => {
  let db: Database.Database;
  let repository: SQLitePromptRepository;
  let key: string;

  beforeEach(() => {
    db = new Database(':memory:');
    initDatabase(db);
    repository = new SQLitePromptRepository(db);

    key = 'Test Key';
  });

  afterEach(() => {
    db.close();
  });

  describe('save + findById', () => {
    it('performs successful round-trip', async () => {
      const prompt = PromptFactory.build();
      await repository.save(prompt);

      const result = await repository.findById(prompt.getId());

      expect(result).not.toBeNull();
      expect(result?.getId()).toBe(prompt.getId());
      expect(result?.getIsDefault()).toBe(prompt?.getIsDefault());
      expect(result?.getIsActive()).toBe(prompt?.getIsActive());
      expect(result?.getKey()).toBe(prompt.getKey());
      expect(result?.getContent()).toBe(prompt.getContent());
      expect(result?.getCreatedAt()).toEqual(prompt.getCreatedAt());
    });
  });

  describe('findAll', () => {
    it('returns all prompts', async () => {
      const promptV1 = PromptFactory.buildDefault();
      const promptV2 = PromptFactory.buildNextVersion(promptV1);
      const promptV3 = PromptFactory.buildNextVersion(promptV2);

      await repository.save(promptV1);
      await repository.save(promptV2);
      await repository.save(promptV3);

      const result = await repository.findAll();

      expect(result).toHaveLength(3);
      expect(result).toEqual([promptV1, promptV2, promptV3]);
    });

    it('returns [] if there are no prompts', async () => {
      const result = await repository.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findByKey', () => {
    it('returns all versions for a key including default', async () => {
      const promptV1 = PromptFactory.buildDefault({ key });
      const promptV2 = PromptFactory.buildNextVersion(promptV1);
      const promptV3 = PromptFactory.buildNextVersion(promptV2);
      const promptV4 = PromptFactory.buildNextVersion(promptV3);

      await repository.save(promptV1);
      await repository.save(promptV2);
      await repository.save(promptV3);
      await repository.save(promptV4);

      const result = await repository.findByKey(key);

      expect(result).toHaveLength(4);
      expect(result).toEqual([promptV1, promptV2, promptV3, promptV4]);
    });

    it('returns [] if there are no prompts for that key', async () => {
      const key = 'java';
      const prompt = PromptFactory.build({ key });

      await repository.save(prompt);

      const missing = await repository.findByKey('missing-key');
      const result = await repository.findByKey(key);

      expect(missing).toEqual([]);
      expect(result).toEqual([prompt]);
    });
  });

  describe('findActiveByKey', () => {
    it('returns correct active key', async () => {
      const promptV1 = PromptFactory.buildDefault({ key });
      const promptV2 = PromptFactory.buildNextVersion(promptV1);

      await repository.save(promptV1);
      await repository.save(promptV2);

      const result = await repository.findActiveByKey(key);

      expect(result).toEqual(promptV1);
    });

    it('throws when no active key', async () => {
      const promptV3 = PromptFactory.build({ key, version: 3 });

      await repository.save(promptV3);

      await expect(repository.findActiveByKey(key)).rejects.toThrow(
        `No active prompt found for key "${key}"`
      );
    });
  });

  describe('setActive', () => {
    it('deactivates all prompts for the target key and activates only the given prompt', async () => {
      const key = 'tagging';
      const otherKey = 'recommendation';

      const promptV1 = PromptFactory.buildDefault({ key });
      const promptV2 = PromptFactory.buildNextVersion(promptV1);
      const promptV3 = PromptFactory.buildNextVersion(promptV2);
      const otherKeyPrompt = PromptFactory.buildDefault({
        key: otherKey,
      });

      await repository.save(promptV1);
      await repository.save(promptV2);
      await repository.save(promptV3);
      await repository.save(otherKeyPrompt);

      await repository.setActive(promptV3.id);

      const prompts = await repository.findByKey(key);
      const activePrompts = prompts.filter((p) => p.isActive);

      expect(activePrompts).toHaveLength(1);
      expect(activePrompts[0].id).toBe(promptV3.id);

      expect(
        prompts.map((p) => ({
          id: p.id,
          isActive: p.isActive,
        }))
      ).toEqual([
        { id: promptV1.id, isActive: false },
        { id: promptV2.id, isActive: false },
        { id: promptV3.id, isActive: true },
      ]);

      // other keys should be left untouched
      const otherKeyActive = await repository.findActiveByKey(otherKey);
      expect(otherKeyActive?.id).toBe(otherKeyPrompt.id);
      expect(otherKeyActive?.isActive).toBe(true);
    });

    it('throws when the target prompt does not exist', async () => {
      await expect(repository.setActive('missing-id')).rejects.toThrow(
        'Prompt not found: missing-id'
      );
    });
  });

  describe('delete', () => {
    it('removes the specified prompt', async () => {
      const prompt = PromptFactory.build();

      await repository.save(prompt);

      await repository.delete(prompt.getId());

      const result = await repository.findById(prompt.getId());

      expect(result).toBeNull();
    });
  });
});
