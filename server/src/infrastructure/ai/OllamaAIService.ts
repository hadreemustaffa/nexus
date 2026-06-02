import type AIService from '../../domain/services/AIService';
import { loadPrompt } from './prompts/loadPrompts';

type TagResponse = {
  tags: string[];
};

export type OllamaConfig = {
  ollamaUrl: string;
  ollamaModel: string;
};

export default class OllamaAIService implements AIService {
  private readonly ollamaUrl: string;
  private readonly ollamaModel: string;

  constructor(config: OllamaConfig) {
    this.ollamaUrl = config.ollamaUrl;
    this.ollamaModel = config.ollamaModel;
  }

  async generateTags(content: string): Promise<string[]> {
    const basePrompt = await loadPrompt('tagging.v1');

    const response = await fetch(`${this.ollamaUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.ollamaModel,
        messages: [
          {
            role: 'system',
            content: basePrompt,
          },
          {
            role: 'user',
            content,
          },
        ],
        format: {
          type: 'object',
          properties: {
            tags: {
              type: 'array',
              items: { type: 'string' },
            },
          },
          required: ['tags'],
          additionalProperties: false,
        },
        stream: false,
      }),
    }).catch((error) => {
      console.error('Ollama request failed:', error);
      throw new Error(
        `Ollama not reachable at ${this.ollamaUrl} — is it running?`
      );
    });

    if (!response.ok) {
      throw new Error(`Ollama request failed: ${response.statusText}`);
    }

    const data = (await response.json()) as {
      message?: {
        content?: string;
      };
    };

    console.log(data);

    if (!data.message?.content) {
      return [];
    }

    const parsed = JSON.parse(data.message.content) as TagResponse;

    return (parsed.tags ?? [])
      .map((tag) => tag.trim().toLowerCase())
      .filter((tag) => tag.length > 0 && tag.length < 50);
  }
}
