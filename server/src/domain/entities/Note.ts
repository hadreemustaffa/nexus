import {
  countCharacters,
  countWords,
  NOTE_TITLE_CHARS_MAX,
  NOTE_WORD_MAX,
  NOTE_WORD_MIN,
  noteCharsCountMessage,
  noteTitleCharsCountTooManyMessage,
  noteWordCountMessage,
  noteWordCountTooFewMessage,
  noteWordCountTooManyMessage,
} from '@nexus/shared';

import { ValidationError } from '../errors/ValidationError';

export default class Note {
  public readonly id: string;
  private title: string;
  private content: string;
  public readonly created_at: Date;
  public updated_at: Date;

  constructor(
    id: string,
    title: string,
    content: string,
    created_at: Date,
    updated_at: Date
  ) {
    this.id = id;
    this.title = title;
    this.content = content;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }

  static create(title: string, content: string): Note {
    this.assertNoteTitle(title);
    this.assertNoteWordCount(content);

    const now = new Date();

    return new Note(crypto.randomUUID(), title.trim(), content, now, now);
  }

  update(title: string = this.title, content: string = this.content): void {
    Note.assertNoteTitle(title);
    Note.assertNoteWordCount(content);

    if (title === this.title && content === this.content) {
      return;
    }

    this.title = title.trim();
    this.content = content;
    this.updated_at = new Date();
  }

  static fromPersistence(data: {
    id: string;
    title: string;
    content: string;
    created_at: Date;
    updated_at: Date;
  }): Note {
    return new Note(
      data.id,
      data.title,
      data.content,
      new Date(data.created_at),
      new Date(data.updated_at)
    );
  }

  private static assertNoteTitle(title: string): void {
    const charsCount = countCharacters(title);

    if (!title.trim()) {
      throw new ValidationError('Must provide a title', [
        { field: 'title', message: 'Title is required' },
      ]);
    }

    if (charsCount > NOTE_TITLE_CHARS_MAX) {
      throw new ValidationError(noteTitleCharsCountTooManyMessage(), [
        { field: 'title', message: noteCharsCountMessage(charsCount) },
      ]);
    }
  }

  private static assertNoteWordCount(content: string): void {
    const wordCount = countWords(content);

    if (!content.trim()) {
      throw new ValidationError('Must provide content', [
        { field: 'content', message: 'Content is required' },
      ]);
    }

    if (wordCount < NOTE_WORD_MIN) {
      throw new ValidationError(noteWordCountTooFewMessage(), [
        { field: 'content', message: noteWordCountMessage(wordCount) },
      ]);
    }

    if (wordCount > NOTE_WORD_MAX) {
      throw new ValidationError(noteWordCountTooManyMessage(), [
        { field: 'content', message: noteWordCountMessage(wordCount) },
      ]);
    }
  }

  getId(): string {
    return this.id;
  }

  getTitle(): string {
    return this.title;
  }

  getContent(): string {
    return this.content;
  }

  getCreatedAt(): Date {
    return this.created_at;
  }

  getUpdatedAt(): Date {
    return this.updated_at;
  }
}
