import type PromptRepository from '../../domain/repositories/PromptRepository';
import type PromptService from '../../domain/services/PromptService';

export default class SQLitePromptService implements PromptService {
  private readonly cache = new Map<string, string>();

  constructor(private readonly promptRepository: PromptRepository) {}

  async get(key: string): Promise<string> {
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    const prompt = await this.promptRepository.findActiveByKey(key);

    if (!prompt) {
      throw new Error(`No active prompt found for key "${key}"`);
    }

    this.cache.set(key, prompt.content);
    return prompt.content;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }
}
