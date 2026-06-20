import Tag from './Tag';

describe('Tag', () => {
  describe('create', () => {
    const validUuid = '3e0542a3-f7f1-4d64-af56-043fb72ec5fa';

    beforeEach(() => {
      vi.useFakeTimers().setSystemTime(new Date('2026-06-20T12:00:00Z'));

      vi.spyOn(crypto, 'randomUUID').mockReturnValue(validUuid);
    });

    afterEach(() => {
      vi.restoreAllMocks();
      vi.useRealTimers();
    });

    it('generates a tag with a random UUID and the current timestamp', () => {
      const tagName = 'consistent';

      const result = Tag.create(tagName);

      expect(result.id).toBe(validUuid);
      expect(result.name).toBe(tagName);
      expect(result.created_at).toEqual(new Date('2026-06-20T12:00:00Z'));
    });
  });

  describe('fromPersistence', () => {
    it('preserves id and timestamps instead of generating new ones', () => {
      const initialDate = new Date('2026-01-01T00:00:00.000Z');

      const tag = new Tag('tag-1', 'persistence', initialDate);

      const actual = Tag.fromPersistence({
        id: tag.getId(),
        name: tag.getName(),
        created_at: tag.getCreatedAt(),
      });

      expect(actual.getId()).toBe(tag.getId());
      expect(actual.getCreatedAt()).toEqual(tag.getCreatedAt());
    });
  });

  describe('validation constraints', () => {
    it('throws ValidationError when tag name is empty/whitespace', () => {
      const actual = () => Tag.create('');

      expect(actual).toThrow('Tag name cannot be empty');
    });
  });
});
