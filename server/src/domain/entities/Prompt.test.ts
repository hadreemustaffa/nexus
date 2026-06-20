import {
  PROMPT_CHARS_MAX,
  PROMPT_CHARS_MIN,
  PROMPT_KEY_MAX,
} from '@nexus/shared';

import Prompt from './Prompt';

describe('Prompt', () => {
  const validKey = 'tagging';
  const validContent =
    'Act as an automated tagging service for digital notes. Analyze the provided text thoroughly to extract exactly three to five highly relevant keywords or categories. Prioritize specific technical terms, entities, and core themes over generic words. Format your output strictly as a standardized JSON array containing only string values. Do not provide any conversational preamble, pleasantries, or explanations before or after the JSON payload. Ensure all tags use lowercase letters and replace spaces with hyphens for slug compatibility. Always verify that every single generated tag explicitly matches the core content present in the text before returning your final JSON response.';

  describe('createDefault', () => {
    it('produces correct value for isDefault, isActive and version', () => {
      const actual = Prompt.createDefault(validKey, validContent);

      expect(actual.isDefault).toBe(true);
      expect(actual.isActive).toBe(true);
      expect(actual.version).toBe(1);
    });
  });

  describe('create', () => {
    it('produces correct value for isDefault, isActive and version', () => {
      const actual = Prompt.create(validKey, validContent, 2);

      expect(actual.isDefault).toBe(false);
      expect(actual.isActive).toBe(false);
      expect(actual.version).toBe(2);
    });
  });

  describe('fromPersistence', () => {
    it('preserves id and timestamps instead of generating new ones', () => {
      const initialDate = new Date('2026-01-01T00:00:00.000Z');

      const prompt = new Prompt(
        'prompt-1',
        validKey,
        validContent,
        2,
        false,
        false,
        initialDate
      );

      const actual = Prompt.fromPersistence({
        id: prompt.getId(),
        key: prompt.getKey(),
        content: prompt.getContent(),
        version: prompt.getVersion(),
        isDefault: prompt.getIsDefault(),
        isActive: prompt.getIsActive(),
        createdAt: prompt.getCreatedAt(),
      });

      expect(actual.getId()).toBe(prompt.getId());
      expect(actual.getCreatedAt()).toEqual(prompt.getCreatedAt());
    });
  });

  describe('getters', () => {
    it('reflects isDefault and isActive correctly', () => {
      const actual = new Prompt(
        'prompt-1',
        validKey,
        validContent,
        2,
        false,
        true,
        new Date('2026-01-01T00:00:00.000Z')
      );

      expect(actual.isEditable).toBe(true);
      expect(actual.isDeletable).toBe(true);
      expect(actual.isActivatable).toBe(false);
    });
  });

  describe('validation constraints', () => {
    it('throws ValidationError when key is empty/whitespace', () => {
      const actual = () => Prompt.create('', validContent, 2);

      expect(actual).toThrow('Must provide a key');
    });

    it('throws ValidationError when key exceeds max characters limit', () => {
      const longKey = Array(PROMPT_KEY_MAX + 1)
        .fill('c')
        .join('');

      const actual = () => Prompt.create(longKey, validContent, 2);

      expect(actual).toThrow(
        `Prompt key cannot exceed ${PROMPT_KEY_MAX} characters`
      );
    });

    it('throws ValidationError when content is empty/whitespace', () => {
      const actual = () => Prompt.create(validKey, '', 2);

      expect(actual).toThrow('Must provide content');
    });

    it('throws ValidationError when content is less than minimum characters limit', () => {
      const shortContent = Array(PROMPT_CHARS_MIN - 1)
        .fill('c')
        .join('');

      const actual = () => Prompt.create(validKey, shortContent, 2);

      expect(actual).toThrow(
        `Prompt must be at least ${PROMPT_CHARS_MIN} characters`
      );
    });

    it('throws ValidationError when content exceed maximum characters limit', () => {
      const longContent = Array(PROMPT_CHARS_MAX + 1)
        .fill('c')
        .join('');

      const actual = () => Prompt.create(validKey, longContent, 2);

      expect(actual).toThrow(
        `Prompt cannot exceed ${PROMPT_CHARS_MAX} characters`
      );
    });

    it('throws ValidationError when content exceed maximum characters limit', () => {
      const longContent = Array(PROMPT_CHARS_MAX + 1)
        .fill('a')
        .join('');

      const actual = () => Prompt.create(validKey, longContent, 2);

      expect(actual).toThrow(
        `Prompt cannot exceed ${PROMPT_CHARS_MAX} characters`
      );
    });

    it('throws ValidationError when version is falsy or 1', () => {
      // only createDefault() has version 1, so this should throw
      const actual = () => Prompt.create(validKey, validContent, 1);

      expect(actual).toThrow('Invalid version number');
    });
  });
});
