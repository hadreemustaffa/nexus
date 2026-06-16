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

export default class Prompt {
  public readonly id: string;
  public readonly key: string;
  public readonly content: string;
  public readonly version: number;
  public readonly isDefault: boolean;
  public readonly isActive: boolean;
  public readonly createdAt: Date;

  constructor(
    id: string,
    key: string,
    content: string,
    version: number,
    isDefault: boolean,
    isActive: boolean,
    createdAt: Date
  ) {
    this.id = id;
    this.key = key;
    this.content = content;
    this.version = version;
    this.isDefault = isDefault;
    this.isActive = isActive;
    this.createdAt = createdAt;
  }

  static createDefault(key: string, content: string): Prompt {
    this.assertPromptKey(key);
    this.assertPromptCharactersCount(content);

    return new Prompt(
      crypto.randomUUID(),
      key,
      content,
      1,
      true,
      true,
      new Date()
    );
  }

  static create(key: string, content: string, version: number): Prompt {
    this.assertPromptKey(key);
    this.assertPromptCharactersCount(content);
    this.assertPromptVersion(version);

    return new Prompt(
      crypto.randomUUID(),
      key,
      content,
      version,
      false,
      false,
      new Date()
    );
  }

  static fromPersistence(data: {
    id: string;
    key: string;
    content: string;
    version: number;
    isDefault: boolean;
    isActive: boolean;
    createdAt: Date;
  }): Prompt {
    return new Prompt(
      data.id,
      data.key,
      data.content,
      data.version,
      data.isDefault,
      data.isActive,
      new Date(data.createdAt)
    );
  }

  private static assertPromptKey(key: string): void {
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

  private static assertPromptCharactersCount(content: string): void {
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

  private static assertPromptVersion(version: number): void {
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

  get isEditable(): boolean {
    return !this.isDefault;
  }

  get isDeletable(): boolean {
    return !this.isDefault;
  }

  get isActivatable(): boolean {
    return !this.isActive;
  }
}
