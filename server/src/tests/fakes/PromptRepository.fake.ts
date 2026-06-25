import Prompt from '../../domain/entities/Prompt';
import PromptRepository from '../../domain/repositories/PromptRepository';

export class FakePromptRepository implements PromptRepository {
  public prompts = new Map<string, Prompt>();

  async save(prompt: Prompt): Promise<void> {
    this.prompts.set(prompt.id, prompt);
  }

  async findById(id: string): Promise<Prompt | null> {
    return this.prompts.get(id) ?? null;
  }

  async findAll(): Promise<Prompt[]> {
    return Array.from(this.prompts.values());
  }

  async findByKey(key: string): Promise<Prompt[]> {
    return Array.from(this.prompts.values()).filter(
      (prompt) => prompt.key === key
    );
  }

  async findActiveByKey(key: string): Promise<Prompt> {
    const prompts = await this.findByKey(key);

    const activePrompt = prompts.find((prompt) => prompt.isActive);

    if (!activePrompt) {
      throw new Error(`No active prompt found for key: ${key}`);
    }

    return activePrompt;
  }

  async setActive(id: string): Promise<void> {
    const target = this.prompts.get(id);

    if (!target) {
      throw new Error(`Prompt not found: ${id}`);
    }

    for (const [promptId, prompt] of this.prompts.entries()) {
      if (prompt.key === target.key) {
        this.prompts.set(promptId, this.cloneWithActive(prompt, false));
      }
    }

    this.prompts.set(id, this.cloneWithActive(target, true));
  }

  async delete(id: string): Promise<void> {
    this.prompts.delete(id);
  }

  private cloneWithActive(prompt: Prompt, isActive: boolean): Prompt {
    return Prompt.fromPersistence({
      id: prompt.id,
      key: prompt.key,
      content: prompt.content,
      version: prompt.version,
      isDefault: prompt.isDefault,
      isActive,
      createdAt: prompt.createdAt,
    });
  }
}
