import { NOTE_WORD_MIN } from '@nexus/shared';

import Note from '../../domain/entities/Note';

interface NoteFactoryOverrides {
  id?: string;
  title?: string;
  content?: string;
}

const NOTE_TEST_TITLE = 'Note Title';
// generated once at file-load time, reusing the reference
const NOTE_TEST_CONTENT = Array(NOTE_WORD_MIN).fill('word').join(' ');

export class NoteFactory {
  /**
   * Generates a Note object with defaults.
   */
  static build(overrides: NoteFactoryOverrides = {}): Note {
    const title = overrides.title ?? NOTE_TEST_TITLE;
    const content = overrides.content ?? NOTE_TEST_CONTENT;
    return Note.create(title, content);
  }

  /**
   * Generates a list of Note objects for bulk testing.
   */
  static buildList(count: number, overrides: Partial<Note> = {}): Note[] {
    return Array.from({ length: count }, () => this.build(overrides));
  }
}
