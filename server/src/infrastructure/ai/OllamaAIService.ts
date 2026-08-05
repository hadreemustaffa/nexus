import Logger from '../../application/ports/Logger';
import type AIService from '../../domain/services/AIService';
import type PromptService from '../../domain/services/PromptService';

type TagResponse = {
  tags: string[];
};

type GenerateTagsResponse = {
  done: boolean;
  done_reason: string;
  total_duration: number;
  prompt_eval_count: number;
  prompt_eval_duration: number;
  eval_count: number;
  eval_duration: number;
  message?: {
    content?: string;
  };
};

export type OllamaConfig = {
  ollamaUrl: string;
  ollamaModel: string;
  promptService: PromptService;
};

export default class OllamaAIService implements AIService {
  private readonly ollamaUrl: string;
  private readonly ollamaModel: string;
  private readonly promptService: PromptService;
  private readonly logger: Logger;

  constructor(config: OllamaConfig, logger: Logger) {
    this.ollamaUrl = config.ollamaUrl;
    this.ollamaModel = config.ollamaModel;
    this.promptService = config.promptService;
    this.logger = logger;
  }

  async generateTags(content: string): Promise<string[]> {
    const basePrompt = await this.promptService.get('tagging');

    let response: Response;

    try {
      response = await fetch(`${this.ollamaUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
                items: {
                  type: 'string',
                },
              },
            },
            required: ['tags'],
            additionalProperties: false,
          },
          stream: false,
        }),
      });
    } catch (error) {
      this.logger.error({ error }, 'Failed to connect to Ollama');

      throw new Error(
        `Ollama not reachable at ${this.ollamaUrl}. Is it running?`,
        { cause: error }
      );
    }

    if (!response.ok) {
      this.logger.error(
        {
          status: response.status,
          statusText: response.statusText,
        },
        'Request failed with non-ok status'
      );

      throw new Error(`Ollama request failed: ${response.statusText}`);
    }

    let data: GenerateTagsResponse;

    try {
      data = (await response.json()) as GenerateTagsResponse;
    } catch (error) {
      this.logger.error({ error }, 'Invalid JSON returned by Ollama');

      throw new Error('Invalid JSON returned by Ollama', {
        cause: error,
      });
    }

    if (!data.message?.content) {
      return [];
    }

    let parsed: TagResponse;

    try {
      parsed = JSON.parse(data.message.content) as TagResponse;
    } catch (error) {
      this.logger.error(
        {
          content: data.message.content,
          error,
        },
        'Failed to parse AI response'
      );

      throw new Error('Failed to parse AI response', {
        cause: error,
      });
    }

    this.logger.info(
      {
        done: data.done,
        done_reason: data.done_reason,
        prompt_eval_count: data.prompt_eval_count,
        prompt_eval_duration_seconds: data.prompt_eval_duration / 1e9,
        eval_count: data.eval_count,
        eval_duration_seconds: data.eval_duration / 1e9,
        total_duration_seconds: data.total_duration / 1e9,
      },
      'Ollama response received'
    );

    return (parsed.tags ?? [])
      .map((tag) => tag.trim().toLowerCase())
      .filter((tag) => tag.length > 0 && tag.length < 50);
  }
}
