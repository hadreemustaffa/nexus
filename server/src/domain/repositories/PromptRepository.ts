import type Prompt from '../entities/Prompt';

export default interface PromptRepository {
  save(prompt: Prompt): Promise<void>;
  findById(id: string): Promise<Prompt | null>;
  findAll(): Promise<Prompt[]>;
  findByKey(key: string): Promise<Prompt[]>;
  findActiveByKey(key: string): Promise<Prompt>;
  setActive(key: string, id: string): Promise<Prompt[]>;
  delete(id: string): Promise<void>;
}
