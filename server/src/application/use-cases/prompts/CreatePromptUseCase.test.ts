import { PROMPT_CHARS_MIN } from '@nexus/shared';

import { PromptFactory } from '../../../tests/factories/Prompt.factory';
import { FakePromptRepository } from '../../../tests/fakes/PromptRepository.fake';
import CreatePromptUseCase from './CreatePromptUseCase';

describe('CreatePromptUseCase', () => {
  let createPromptUseCase: CreatePromptUseCase;
  let promptRepository: FakePromptRepository;
  let content: string;

  beforeEach(() => {
    promptRepository = new FakePromptRepository();
    createPromptUseCase = new CreatePromptUseCase(promptRepository);

    content = Array(PROMPT_CHARS_MIN).fill('chars').join(' ');
  });

  it('creates and saves a prompt with correct version when no prompt exists for the key', async () => {
    const key = 'tagging';
    const result = await createPromptUseCase.execute(key, content);

    expect(result.key).toBe(key);
    expect(result.content).toBe(content);
    expect(result.version).toBe(2);

    const saved = await promptRepository.findById(result.id);
    expect(saved).toEqual(result);
  });

  it('creates version 2 when the default prompt exists for the key', async () => {
    const key = 'tagging';
    const newContent = content + ' new';
    const defaultPrompt = PromptFactory.buildDefault({ key });

    await promptRepository.save(defaultPrompt);

    const result = await createPromptUseCase.execute(key, newContent);

    expect(result.version).toBe(2);
  });

  it('increments version from the highest existing version for the same key', async () => {
    const key = 'tagging';
    const newContent = content + ' new';

    const promptV1 = PromptFactory.buildDefault({ key });
    const promptV4 = PromptFactory.build({ key, version: 4 });

    await promptRepository.save(promptV1);
    await promptRepository.save(promptV4);

    const result = await createPromptUseCase.execute(key, newContent);

    expect(result.version).toBe(5);
  });

  it('ignores prompts from other keys when calculating the next version', async () => {
    const targetKey = 'tagging';
    const otherKey = 'recommendation';

    await promptRepository.save(
      PromptFactory.build({ key: targetKey, version: 2 })
    );
    await promptRepository.save(
      PromptFactory.build({ key: otherKey, version: 10 })
    );

    const result = await createPromptUseCase.execute(targetKey, content);

    expect(result.version).toBe(3);
  });
});
