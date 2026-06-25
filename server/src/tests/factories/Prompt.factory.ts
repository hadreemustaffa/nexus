import { PROMPT_CHARS_MIN } from '@nexus/shared';

import Prompt from '../../domain/entities/Prompt';

interface PromptFactoryOverrides {
  key?: string;
  content?: string;
  version?: number;
}

const PROMPT_TEST_KEY = 'Prompt Key';
// generated once at file-load time, reusing the reference
const PROMPT_TEST_CONTENT = Array(PROMPT_CHARS_MIN).fill('chars').join(' ');
// has to be at least 2, using 1 will throw for create()
const PROMPT_TEST_VERSION = 2;

export class PromptFactory {
  /**
   * Generates a Prompt object with defaults.
   * Use this when version is not the thing under test.
   */
  static build(overrides: PromptFactoryOverrides = {}): Prompt {
    const key = overrides.key ?? PROMPT_TEST_KEY;
    const content = overrides.content ?? PROMPT_TEST_CONTENT;
    const version = overrides.version ?? PROMPT_TEST_VERSION;

    return Prompt.create(key, content, version);
  }

  /**
   * Generates and represents the seeded default prompt created on initial launch.
   */
  static buildDefault(
    overrides: Omit<PromptFactoryOverrides, 'version'> = {}
  ): Prompt {
    const key = overrides.key ?? PROMPT_TEST_KEY;
    const content = overrides.content ?? PROMPT_TEST_CONTENT;

    return Prompt.createDefault(key, content);
  }

  /**
   * Generates a prompt object with next version after an existing prompt.
   */
  static buildNextVersion(
    previous: Prompt,
    overrides: Omit<PromptFactoryOverrides, 'version' | 'key'> = {}
  ): Prompt {
    return this.build({
      ...overrides,
      key: previous.key,
      version: previous.version + 1,
    });
  }

  /**
   * Generates a list of Prompt objects for bulk testing.
   * e.g version start at 2 and increment: 2, 3, 4, ...
   */
  static buildList(
    count: number,
    overrides: Omit<PromptFactoryOverrides, 'version'> = {}
  ): Prompt[] {
    return Array.from({ length: count }, (_, index) =>
      this.build({
        ...overrides,
        version: index + 2,
      })
    );
  }

  /**
   * Builds a list of custom prompts starting from a specific version.
   * e.g version start at 4, count 3 => versions 4, 5, 6
   */
  static buildVersionedListFrom(
    startVersion: number,
    count: number,
    overrides: Omit<PromptFactoryOverrides, 'version'> = {}
  ): Prompt[] {
    return Array.from({ length: count }, (_, index) =>
      this.build({
        ...overrides,
        version: startVersion + index,
      })
    );
  }
}
