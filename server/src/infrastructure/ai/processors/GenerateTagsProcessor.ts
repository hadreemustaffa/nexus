import type EventBus from '../../../application/events/EventBus';
import type { GenerateTagsJob } from '../../../application/jobs/GenerateTagsJob';
import { buildJobCancellationKey } from '../../../application/jobs/JobCancellationKey';
import type JobProcessor from '../../../application/jobs/JobProcessor';
import Logger from '../../../application/ports/Logger';
import Tag from '../../../domain/entities/Tag';
import NoteRepository from '../../../domain/repositories/NoteRepository';
import type TagRepository from '../../../domain/repositories/TagRepository';
import type AIService from '../../../domain/services/AIService';
import JobCancellationRegistry from '../../queues/JobCancellationRegistry';
import { isAbortError } from '../isAbortError';

export default class GenerateTagsProcessor implements JobProcessor<GenerateTagsJob> {
  private tagRepository: TagRepository;
  private aiService: AIService;
  private eventBus: EventBus;
  private logger: Logger;
  private noteRepository: NoteRepository;
  private jobCancellationRegistry: JobCancellationRegistry;

  constructor(
    tagRepository: TagRepository,
    aiService: AIService,
    eventBus: EventBus,
    logger: Logger,
    noteRepository: NoteRepository,
    jobCancellationRegistry: JobCancellationRegistry
  ) {
    this.tagRepository = tagRepository;
    this.aiService = aiService;
    this.eventBus = eventBus;
    this.logger = logger;
    this.noteRepository = noteRepository;
    this.jobCancellationRegistry = jobCancellationRegistry;
  }

  async process(job: GenerateTagsJob): Promise<void> {
    const note = await this.noteRepository.findById(job.noteId);
    // if note was deleted before this job runs
    if (!note) {
      this.logger.warn({ cause: 'Note not found' }, 'Unable to process job');
      return;
    }

    const key = buildJobCancellationKey('GENERATE_TAGS', job.noteId);
    const abortController = this.jobCancellationRegistry.begin(key);

    try {
      let tags: string[];

      try {
        this.logger.info({ noteId: job.noteId }, 'Processing job...');

        tags = await this.aiService.generateTags(
          job.content,
          abortController.signal
        );
      } catch (error) {
        if (isAbortError(error)) {
          this.logger.error({ noteId: job.noteId }, 'Job cancelled for note');
          return;
        }
        throw error;
      }

      // cancelled in the gap right after resolve
      if (abortController.signal.aborted) return;

      const tagsPayload: Tag[] = [];

      await Promise.all(
        tags.map(async (name) => {
          let tag = await this.tagRepository.findByName(name);

          if (!tag) {
            tag = Tag.create(name);
            await this.tagRepository.save(tag);
          }

          await this.tagRepository.attachTagToNote(job.noteId, tag.getId());

          tagsPayload.push(tag);
        })
      );

      await this.eventBus.publish({
        type: 'NOTE_TAGS_GENERATED',
        occurredAt: new Date(),
        payload: {
          noteId: job.noteId,
          tags: tagsPayload,
        },
      });
    } finally {
      this.jobCancellationRegistry.end(key);
    }
  }
}
