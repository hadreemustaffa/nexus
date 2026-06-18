import type PromptRepository from '../../../domain/repositories/PromptRepository';

export default class GetAllPromptsUseCase {
  private promptRepository: PromptRepository;

  constructor(promptRepository: PromptRepository) {
    this.promptRepository = promptRepository;
  }

  async execute() {
    const prompts = await this.promptRepository.findAll();

    return prompts;
  }
}
