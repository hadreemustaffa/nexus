import FakePromptService from '../../tests/fakes/PromptService.fake';
import { mockOllamaResponse } from '../../tests/mocks/OllamaResponse.mock';
import OllamaAIService from './OllamaAIService';

const OLLAMA_URL = 'http://fake-ollama.local';
const OLLAMA_MODEL = 'qwen3';

describe('OllamaAIService', () => {
  let service: OllamaAIService;

  beforeEach(() => {
    global.fetch = vi.fn();

    service = new OllamaAIService({
      ollamaUrl: OLLAMA_URL,
      ollamaModel: OLLAMA_MODEL,
      promptService: new FakePromptService({
        tagging: 'Generate tags',
      }),
    });
  });

  it('parses, normalizes and filters tags', async () => {
    mockOllamaResponse(
      JSON.stringify({
        tags: [' React ', 'TypeScript', '', 'A'.repeat(51), 'Frontend'],
      })
    );

    const tags = await service.generateTags('content');

    expect(tags).toEqual(['react', 'typescript', 'frontend']);
  });

  it('returns an empty array when message.content is missing', async () => {
    mockOllamaResponse();

    const tags = await service.generateTags('content');

    expect(tags).toEqual([]);
  });

  it('throws a descriptive error when ollama is unreachable', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('ECONNREFUSED'));

    await expect(service.generateTags('content')).rejects.toThrow(
      `Ollama not reachable at ${OLLAMA_URL}`
    );
  });

  it('throws when ollama responds with a non-ok status', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      statusText: 'Internal Server Error',
    } as Response);

    await expect(service.generateTags('content')).rejects.toThrow(
      'Ollama request failed: Internal Server Error'
    );
  });
});
