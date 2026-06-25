import Prompt from '../../../domain/entities/Prompt';
import type PromptRepository from '../../../domain/repositories/PromptRepository';
import { taggingPrompt } from '../default-prompts/tagging';

export const DEFAULT_PROMPTS: Record<string, string> = {
  tagging: taggingPrompt,
};

export async function seedDefaultPrompts(
  promptRepository: PromptRepository
): Promise<void> {
  for (const [key, content] of Object.entries(DEFAULT_PROMPTS)) {
    const existing = await promptRepository.findByKey(key);
    const hasDefault = existing.some((p) => p.isDefault);

    if (!hasDefault) {
      await promptRepository.save(Prompt.createDefault(key, content));
    }
  }
}
