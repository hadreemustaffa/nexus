import { countCharacters, countWords } from '@nexus/shared';
import {
  NOTE_TITLE_CHARS_MAX,
  NOTE_WORD_MAX,
  NOTE_WORD_MIN,
  noteCharsCountMessage,
  noteTitleCharsCountTooManyMessage,
  noteWordCountMessage,
  noteWordCountTooFewMessage,
  noteWordCountTooManyMessage,
} from '@nexus/shared/note';

import { ValidationError } from '../errors/ValidationError';

export function assertNoteTitle(title: string): void {
  const charsCount = countCharacters(title);

  if (!title.trim()) {
    throw new ValidationError('Must provide a title', [
      { field: 'title', message: 'Title is required' },
    ]);
  }

  if (title.trim().length > NOTE_TITLE_CHARS_MAX) {
    if (charsCount < NOTE_WORD_MIN) {
      throw new ValidationError(noteTitleCharsCountTooManyMessage(), [
        { field: 'title', message: noteCharsCountMessage(charsCount) },
      ]);
    }
  }
}

export function assertNoteWordCount(content: string): void {
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
