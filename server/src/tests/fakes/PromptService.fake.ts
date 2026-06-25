import type PromptService from '../../domain/services/PromptService';

export default class FakePromptService implements PromptService {
  constructor(private readonly prompts: Record<string, string> = {}) {}

  async get(key: string): Promise<string> {
    const prompt = this.prompts[key];

    if (!prompt) {
      throw new Error(`Prompt "${key}" not found`);
    }

    return prompt;
  }
}
