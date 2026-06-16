import Prompt from '../../../domain/entities/Prompt';
import type PromptRepository from '../../../domain/repositories/PromptRepository';

export default class CreatePrompt {
  private promptRepository: PromptRepository;

  constructor(promptRepository: PromptRepository) {
    this.promptRepository = promptRepository;
  }

  async execute(key: string, content: string) {
    const existing = await this.promptRepository.findByKey(key);
    const lastPromptVersion = existing.reduce(
      (max, p) => (p.version > max ? p.version : max),
      1
    );
    const newVersion = lastPromptVersion + 1;
    const prompt = Prompt.create(key, content, newVersion);
    await this.promptRepository.save(prompt);

    return prompt;
  }
}
