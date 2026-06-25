import { PROMPT_CHARS_MIN } from '@nexus/shared';

import { PromptFactory } from '../../tests/factories/Prompt.factory';
import { FakePromptRepository } from '../../tests/fakes/PromptRepository.fake';
import SQLitePromptService from './SQLitePromptService';

describe('SQLitePromptService', () => {
  let service: SQLitePromptService;
  let promptRepository: FakePromptRepository;
  let content: string;

  beforeEach(() => {
    promptRepository = new FakePromptRepository();
    service = new SQLitePromptService(promptRepository);
    content = Array(PROMPT_CHARS_MIN).fill('prompt').join(' ');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns result from repository on first call', async () => {
    const prompt = PromptFactory.buildDefault({
      key: 'tagging',
      content: content,
    });

    await promptRepository.save(prompt);

    await expect(service.get('tagging')).resolves.toBe(content);
  });

  it('uses cache on subsequent calls', async () => {
    const findActiveByKeySpy = vi.spyOn(promptRepository, 'findActiveByKey');

    const prompt = PromptFactory.buildDefault({
      key: 'tagging',
      content: content,
    });

    await promptRepository.save(prompt);

    await service.get('tagging');
    await service.get('tagging');

    expect(findActiveByKeySpy).toHaveBeenCalledTimes(1);
  });

  it('calls repository again after cache invalidation', async () => {
    const findActiveByKeySpy = vi.spyOn(promptRepository, 'findActiveByKey');

    const prompt = PromptFactory.buildDefault({
      key: 'tagging',
      content: content,
    });

    await promptRepository.save(prompt);

    await service.get('tagging');
    service.invalidate('tagging');
    await service.get('tagging');

    expect(findActiveByKeySpy).toHaveBeenCalledTimes(2);
  });

  it('throws when no active prompt exists', async () => {
    await expect(service.get('missing')).rejects.toThrow(
      'No active prompt found for key: missing'
    );
  });
});
