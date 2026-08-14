import { GenerateTagsJob } from '../../../application/jobs/GenerateTagsJob';
import { buildJobCancellationKey } from '../../../application/jobs/JobCancellationKey';
import { NoteFactory } from '../../../tests/factories/Note.factory';
import { TagFactory } from '../../../tests/factories/Tag.factory';
import { FakeAIService } from '../../../tests/fakes/AIService.fake';
import { FakeEventBus } from '../../../tests/fakes/EventBus.fake';
import FakeLogger from '../../../tests/fakes/Logger.fake';
import { FakeNoteRepository } from '../../../tests/fakes/NoteRepository.fake';
import { FakeTagRepository } from '../../../tests/fakes/TagRepository.fake';
import { expectEvent } from '../../../tests/utils/expectEvent';
import JobCancellationRegistry from '../../queues/JobCancellationRegistry';
import GenerateTagsProcessor from './GenerateTagsProcessor';

describe('GenerateTagsProcessor', () => {
  let aiService: FakeAIService;
  let noteRepository: FakeNoteRepository;
  let tagRepository: FakeTagRepository;
  let eventBus: FakeEventBus;
  let logger: FakeLogger;
  let generateTagsProcessor: GenerateTagsProcessor;
  let jobCancellationRegistry: JobCancellationRegistry;
  let job: GenerateTagsJob;
  let cancelJobKey: string;

  beforeEach(async () => {
    aiService = new FakeAIService();
    noteRepository = new FakeNoteRepository();
    tagRepository = new FakeTagRepository();
    eventBus = new FakeEventBus();
    logger = new FakeLogger();
    jobCancellationRegistry = new JobCancellationRegistry();

    generateTagsProcessor = new GenerateTagsProcessor(
      tagRepository,
      aiService,
      eventBus,
      logger,
      noteRepository,
      jobCancellationRegistry
    );

    // create and save note since there is guard clause in the processor
    const note = NoteFactory.build();
    await noteRepository.save(note);

    job = { noteId: note.getId(), content: note.getContent() };
    cancelJobKey = buildJobCancellationKey('GENERATE_TAGS', job.noteId);
  });

  describe('process', () => {
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
      expect(savedTags).toHaveLength(1);
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

    it('bails out without calling the AI service if the note was deleted before the job started', async () => {
      // overwrite the seeded note with a job pointing at one that doesn't exist
      const orphanJob: GenerateTagsJob = { ...job, noteId: 'never-existed' };
      const generateTagsSpy = vi.spyOn(aiService, 'generateTags');
      const beginSpy = vi.spyOn(jobCancellationRegistry, 'begin');

      await generateTagsProcessor.process(orphanJob);

      expect(generateTagsSpy).not.toHaveBeenCalled();
      expect(beginSpy).not.toHaveBeenCalled();
      expect(eventBus.published).toHaveLength(0);
    });

    it('calls begin() with the namespaced registry key before calling the AI service', async () => {
      const beginSpy = vi.spyOn(jobCancellationRegistry, 'begin');
      aiService.setTags(['typescript']);

      await generateTagsProcessor.process(job);

      expect(beginSpy).toHaveBeenCalledWith(cancelJobKey);
    });

    it('calls end() on successful completion', async () => {
      const endSpy = vi.spyOn(jobCancellationRegistry, 'end');
      aiService.setTags(['typescript']);

      await generateTagsProcessor.process(job);

      expect(endSpy).toHaveBeenCalledWith(cancelJobKey);
    });

    it('does not save or publish when cancelled mid-flight, and still calls end()', async () => {
      const endSpy = vi.spyOn(jobCancellationRegistry, 'end');
      aiService.pending();

      const processPromise = generateTagsProcessor.process(job);
      await Promise.resolve(); // let process() reach the in-flight generateTags() call

      jobCancellationRegistry.cancel(cancelJobKey);
      await processPromise;

      expect(await tagRepository.findAll()).toHaveLength(0);
      expect(eventBus.published).toHaveLength(0);
      expect(endSpy).toHaveBeenCalledWith(cancelJobKey);
    });

    it('does not save or publish when cancelled after the AI call resolves but before writes', async () => {
      const endSpy = vi.spyOn(jobCancellationRegistry, 'end');
      aiService.pending();

      const processPromise = generateTagsProcessor.process(job);
      // let process() reach the in-flight generateTags() call
      await Promise.resolve();

      aiService.resolvePending(['typescript']);
      // fires before the post-resolve checkpoint runs
      jobCancellationRegistry.cancel(cancelJobKey);
      await processPromise;

      expect(await tagRepository.findAll()).toHaveLength(0);
      expect(eventBus.published).toHaveLength(0);
      expect(endSpy).toHaveBeenCalledWith(cancelJobKey);
    });

    it('propagates a real (non-abort) AI service error and still calls end()', async () => {
      const endSpy = vi.spyOn(jobCancellationRegistry, 'end');
      aiService.setError(new Error('Ollama unreachable'));

      await expect(generateTagsProcessor.process(job)).rejects.toThrow(
        'Ollama unreachable'
      );

      expect(endSpy).toHaveBeenCalledWith(cancelJobKey);
      expect(eventBus.published).toHaveLength(0);
    });
  });
});
