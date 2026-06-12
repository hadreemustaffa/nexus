import {
  countCharacters,
  PROMPT_CHARS_MAX,
  PROMPT_CHARS_MIN,
  PROMPT_KEY_MAX,
  promptCharCountMessage,
  promptCharCountTooFewMessage,
  promptCharCountTooManyMessage,
  promptKeyCountTooManyMessage,
} from '@nexus/shared';

import { ValidationError } from '../errors/ValidationError';

export function assertPromptKey(key: string): void {
  const charsCount = countCharacters(key);

  if (!key.trim()) {
    throw new ValidationError('Must provide a key', [
      { field: 'key', message: 'Key is required' },
    ]);
  }

  if (charsCount > PROMPT_KEY_MAX) {
    throw new ValidationError(promptKeyCountTooManyMessage(), [
      { field: 'key', message: promptCharCountMessage(charsCount) },
    ]);
  }
}

export function assertPromptCharactersCount(content: string): void {
  const charsCount = countCharacters(content);

  if (!content.trim()) {
    throw new ValidationError('Must provide content', [
      { field: 'content', message: 'Content is required' },
    ]);
  }

  if (charsCount < PROMPT_CHARS_MIN) {
    throw new ValidationError(promptCharCountTooFewMessage(), [
      { field: 'content', message: promptCharCountMessage(charsCount) },
    ]);
  }

  if (charsCount > PROMPT_CHARS_MAX) {
    throw new ValidationError(promptCharCountTooManyMessage(), [
      { field: 'content', message: promptCharCountMessage(charsCount) },
    ]);
  }
}

export function assertPromptVersion(version: number): void {
  if (!version) {
    throw new ValidationError('Must provide a version', [
      { field: 'version', message: 'Version is required' },
    ]);
  }

  if (version === 1) {
    throw new ValidationError('Invalid version number', [
      { field: 'version', message: 'Version number cannot be 1' },
    ]);
  }
}
