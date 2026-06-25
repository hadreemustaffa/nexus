import { PromptFactory } from '../../../tests/factories/Prompt.factory';
import { FakePromptRepository } from '../../../tests/fakes/PromptRepository.fake';
import GetAllPromptsUseCase from './GetAllPromptsUseCase';

describe('GetAllPromptsUseCase', () => {
  let getAllPromptsUseCase: GetAllPromptsUseCase;
  let promptRepository: FakePromptRepository;

  beforeEach(() => {
    promptRepository = new FakePromptRepository();
    getAllPromptsUseCase = new GetAllPromptsUseCase(promptRepository);
  });

  it('returns correct list of prompts', async () => {
    const taggingPromptV1 = PromptFactory.buildDefault();
    const taggingPromptV2 = PromptFactory.build();
    const recommendationPromptV1 = PromptFactory.buildDefault({
      key: 'recommendation',
    });

    await promptRepository.save(taggingPromptV1);
    await promptRepository.save(taggingPromptV2);
    await promptRepository.save(recommendationPromptV1);

    const result = await getAllPromptsUseCase.execute();

    expect(result).toEqual([
      taggingPromptV1,
      taggingPromptV2,
      recommendationPromptV1,
    ]);
  });

  it('returns [] when there are no prompts', async () => {
    const result = await getAllPromptsUseCase.execute();

    expect(result).toEqual([]);
  });
});
