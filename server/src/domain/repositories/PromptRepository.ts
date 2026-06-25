import type Prompt from '../entities/Prompt';

export default interface PromptRepository {
  save(prompt: Prompt): Promise<void>;
  findById(id: string): Promise<Prompt | null>;
  findAll(): Promise<Prompt[]>;
  findByKey(key: string): Promise<Prompt[]>;
  findActiveByKey(key: string): Promise<Prompt | null>;
  setActive(id: string): Promise<void>;
  delete(id: string): Promise<void>;
}
