import {
  NOTE_TITLE_CHARS_MAX,
  NOTE_WORD_MAX,
  NOTE_WORD_MIN,
} from '@nexus/shared';

import Note from './Note';

describe('Note', () => {
  const validTitle = 'Clean Architecture Use Cases in a Note-Taking App';

  const validContent = `
    Clean Architecture separates business rules from frameworks and delivery mechanisms.
    In a note-taking app, the application layer can expose use cases such as CreateNote,
    UpdateNote, SearchNotes, and RecommendRelatedNotes. These use cases should not know
    about Express, React, or SQLite directly.

    A repository interface can be defined in the domain or application layer, while the
    infrastructure layer provides the concrete implementation. This allows tests to use
    an in-memory fake repository without touching the database. It also keeps the use
    cases focused on business behavior rather than persistence details.

    For example, CreateNote should validate the title and content before saving. The title
    must not be empty, and the content should meet the minimum word count required by the
    application. Once validation passes, the note entity can be created and passed to the
    repository for storage. This design makes the code easier to test and evolve over time.
    `;

  describe('create', () => {
    it('creates a note with valid title and content', () => {
      const actual = Note.create(validTitle, validContent);

      expect(actual.getTitle()).toBe(validTitle);
      expect(actual.getContent()).toBe(validContent);
    });
  });

  describe('update', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('does not update when there is no changes', () => {
      vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
      const initialDate = new Date('2026-01-01T00:00:00.000Z');

      const note = new Note(
        'note-1',
        validTitle,
        validContent,
        initialDate,
        initialDate
      );

      vi.advanceTimersByTime(5 * 60 * 1000);

      note.update(validTitle, validContent);

      expect(note.getUpdatedAt()).toEqual(initialDate);
    });

    it('updates when there is title or content changes', () => {
      vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
      const initialDate = new Date('2026-01-01T00:00:00.000Z');

      const note = new Note(
        'note-1',
        validTitle,
        validContent,
        initialDate,
        initialDate
      );

      vi.advanceTimersByTime(5 * 60 * 1000);

      const changedTitle = `${validTitle} Changed`;
      note.update(changedTitle, validContent);

      const expectedUpdatedDate = new Date(Date.now());
      expect(note.getUpdatedAt()).toEqual(expectedUpdatedDate);
    });
  });

  describe('fromPersistence', () => {
    it('preserves id and timestamps instead of generating new ones', () => {
      const initialDate = new Date('2026-01-01T00:00:00.000Z');

      const note = new Note(
        'note-1',
        validTitle,
        validContent,
        initialDate,
        initialDate
      );

      const actual = Note.fromPersistence({
        id: note.getId(),
        title: note.getTitle(),
        content: note.getContent(),
        created_at: note.getCreatedAt(),
        updated_at: note.getUpdatedAt(),
      });

      expect(actual.getId()).toBe(note.getId());
      expect(actual.getCreatedAt()).toEqual(note.getCreatedAt());
      expect(actual.getUpdatedAt()).toEqual(note.getUpdatedAt());
    });
  });

  describe('validation constraints', () => {
    it('throws ValidationError when title is empty/whitespace', () => {
      const actual = () => Note.create('', validContent);

      expect(actual).toThrow('Must provide a title');
    });

    it('throws ValidationError when title exceeds max characters limit', () => {
      const longTitle = Array(NOTE_TITLE_CHARS_MAX + 1)
        .fill('c')
        .join(' ');

      const actual = () => Note.create(longTitle, validContent);

      expect(actual).toThrow(
        `Note title cannot exceed ${NOTE_TITLE_CHARS_MAX} characters`
      );
    });

    it('throws ValidationError when content is less than minimum words limit', () => {
      const shortContent = Array(NOTE_WORD_MIN - 1)
        .fill('word')
        .join(' ');

      const actual = () => Note.create(validTitle, shortContent);

      expect(actual).toThrow(`Note must be at least ${NOTE_WORD_MIN} words`);
    });

    it('throws ValidationError when content exceed maximum words limit', () => {
      const longContent = Array(NOTE_WORD_MAX + 1)
        .fill('word')
        .join(' ');

      const actual = () => Note.create(validTitle, longContent);

      expect(actual).toThrow(`Note cannot exceed ${NOTE_WORD_MAX} words`);
    });
  });
});
