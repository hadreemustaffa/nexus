import AIService from '../../domain/services/AIService';

export class FakeAIService implements AIService {
  constructor(private tags: string[] = []) {}

  setTags(tags: string[]): void {
    this.tags = tags;
  }

  async generateTags(): Promise<string[]> {
    return this.tags;
  }
}
