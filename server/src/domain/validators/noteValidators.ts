import {
  countWords,
  NOTE_WORD_MAX,
  NOTE_WORD_MIN,
  noteWordCountMessage,
  noteWordCountTooFewMessage,
  noteWordCountTooManyMessage,
} from '@nexus/shared/note';

import { ValidationError } from '../errors/ValidationError';

export function assertNoteTitle(title: string): void {
  if (!title.trim()) {
    throw new ValidationError('Must provide a title', [
      { field: 'title', message: 'Title is required' },
    ]);
  }
}

export function assertNoteWordCount(content: string): void {
  const wordCount = countWords(content);

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
