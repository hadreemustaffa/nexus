import { NOTE_WORD_MIN } from '@nexus/shared';

import { GenerateTagsJob } from '../../../application/jobs/GenerateTagsJob';
import { TagFactory } from '../../../tests/factories/Tag.factory';
import { FakeAIService } from '../../../tests/fakes/AIService.fake';
import { FakeEventBus } from '../../../tests/fakes/EventBus.fake';
import { FakeTagRepository } from '../../../tests/fakes/TagRepository.fake';
import { expectEvent } from '../../../tests/utils/expectEvent';
import GenerateTagsProcessor from './GenerateTagsProcessor';

describe('GenerateTagsProcessor', () => {
  let aiService: FakeAIService;
  let tagRepository: FakeTagRepository;
  let eventBus: FakeEventBus;
  let generateTagsProcessor: GenerateTagsProcessor;
  let job: GenerateTagsJob;

  beforeEach(() => {
    aiService = new FakeAIService();
    tagRepository = new FakeTagRepository();
    eventBus = new FakeEventBus();

    generateTagsProcessor = new GenerateTagsProcessor(
      tagRepository,
      aiService,
      eventBus
    );

    const content = Array(NOTE_WORD_MIN).fill('word').join(' ');
    job = { noteId: 'note-1', content: content };
  });

  it('creates tags that do not exist yet and attaches them to the note', async () => {
    aiService.setTags(['typescript', 'testing']);

    await generateTagsProcessor.process(job);

    const savedNames = (await tagRepository.findAll())
      .map((t) => t.getName())
      .sort();
    expect(savedNames).toEqual(['testing', 'typescript']);

    const attachedNames = (await tagRepository.findAllByNoteId(job.noteId))
      .map((t) => t.getName())
      .sort();
    expect(attachedNames).toEqual(['testing', 'typescript']);
  });

  it('reuses an existing tag instead of creating a duplicate', async () => {
    const name = 'typescript';
    const existing = TagFactory.build({ name: name });
    await tagRepository.save(existing);

    aiService.setTags([name]);

    await generateTagsProcessor.process(job);

    const savedTags = await tagRepository.findAll();
    expect(savedTags).toHaveLength(1); // not duplicated
    expect(savedTags[0].getId()).toBe(existing.getId());

    const attached = await tagRepository.findAllByNoteId(job.noteId);
    expect(attached).toHaveLength(1);
    expect(attached[0].getId()).toBe(existing.getId());
  });

  it('publishes NOTE_TAGS_GENERATED with the note id and the resulting tags', async () => {
    aiService.setTags(['typescript', 'testing']);

    await generateTagsProcessor.process(job);

    expect(eventBus.published).toHaveLength(1);

    const event = expectEvent(eventBus.published[0], 'NOTE_TAGS_GENERATED');

    expect(event.payload.noteId).toBe(job.noteId);
    expect(event.payload.tags.map((t) => t.getName()).sort()).toEqual([
      'testing',
      'typescript',
    ]);
  });

  it('publishes an event with an empty tags array when the AI service returns none', async () => {
    await generateTagsProcessor.process(job);

    const allTags = await tagRepository.findAll();
    const allTagsByNoteId = await tagRepository.findAllByNoteId(job.noteId);

    expect(allTags).toHaveLength(0);
    expect(allTagsByNoteId).toHaveLength(0);

    const event = expectEvent(eventBus.published[0], 'NOTE_TAGS_GENERATED');

    expect(event.payload.tags).toEqual([]);
  });
});
