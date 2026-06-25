import { PromptFactory } from '../../../tests/factories/Prompt.factory';
import { FakePromptRepository } from '../../../tests/fakes/PromptRepository.fake';
import { DEFAULT_PROMPTS, seedDefaultPrompts } from './promptSeeds';

describe('promptSeeds', () => {
  let promptRepository: FakePromptRepository;

  beforeEach(() => {
    promptRepository = new FakePromptRepository();
  });

  it('seeds a default prompt for every key that has none', async () => {
    await seedDefaultPrompts(promptRepository);

    const allPrompts = await promptRepository.findAll();

    expect(allPrompts).toHaveLength(Object.keys(DEFAULT_PROMPTS).length);

    for (const key of Object.keys(DEFAULT_PROMPTS)) {
      const prompts = await promptRepository.findByKey(key);

      expect(prompts).toHaveLength(1);
      expect(prompts[0].key).toBe(key);
      expect(prompts[0].isDefault).toBe(true);
      expect(prompts[0].version).toBe(1);
    }
  });

  it('does not seed another default prompt when a default already exists for the key', async () => {
    const key = 'tagging';
    const existingDefault = PromptFactory.buildDefault({ key });

    await promptRepository.save(existingDefault);

    await seedDefaultPrompts(promptRepository);

    const prompts = await promptRepository.findByKey(key);
    const defaultPrompts = prompts.filter((p) => p.isDefault);

    expect(defaultPrompts).toHaveLength(1);
    expect(defaultPrompts[0]).toEqual(existingDefault);
  });

  it('seeds only missing defaults and preserves existing defaults', async () => {
    const existingKey = 'tagging';
    const existingDefault = PromptFactory.buildDefault({ key: existingKey });

    await promptRepository.save(existingDefault);

    await seedDefaultPrompts(promptRepository);

    const allPrompts = await promptRepository.findAll();

    expect(allPrompts).toHaveLength(Object.keys(DEFAULT_PROMPTS).length);

    const taggingPrompts = await promptRepository.findByKey(existingKey);
    const taggingDefaults = taggingPrompts.filter((p) => p.isDefault);

    expect(taggingDefaults).toHaveLength(1);
    expect(taggingDefaults[0]).toEqual(existingDefault);
  });
});
