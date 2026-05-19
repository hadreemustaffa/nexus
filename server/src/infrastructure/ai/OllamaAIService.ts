import type AIService from '../../domain/services/AIService';
import { loadPrompt } from './prompts/loadPrompts';

type TagResponse = {
  tags: string[];
};

const url = process.env.OLLAMA_URL ?? 'http://localhost:11434';

export default class OllamaAIService implements AIService {
  async generateTags(content: string): Promise<string[]> {
    const basePrompt = await loadPrompt('tagging.v1');

    const response = await fetch(`${url}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'qwen2.5:7b',
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
