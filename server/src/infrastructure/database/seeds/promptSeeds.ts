import Prompt from '../../../domain/entities/Prompt';
import PromptRepository from '../../../domain/repositories/PromptRepository';
import { taggingPrompt } from '../default-prompts/tagging';

const DEFAULT_PROMPTS: Record<string, string> = {
  tagging: taggingPrompt,
};

export async function seedPrompts(
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
