import type EventBus from '../application/events/EventBus';
import type Logger from '../application/ports/Logger';
import type NoteRepository from '../domain/repositories/NoteRepository';
import type TagRepository from '../domain/repositories/TagRepository';
import type AIService from '../domain/services/AIService';
import GenerateTagsProcessor from '../infrastructure/ai/processors/GenerateTagsProcessor';
import JobCancellationRegistry from '../infrastructure/queues/JobCancellationRegistry';
import WorkerRegistry from '../infrastructure/queues/WorkerRegistry';

export default function setupWorkers(
  deps: {
    tagRepository: TagRepository;
    aiService: AIService;
    eventBus: EventBus;
    logger: Logger;
    noteRepository: NoteRepository;
  },
  workerPollIntervalMs: number
) {
  const workerRegistry = new WorkerRegistry(workerPollIntervalMs);
  const jobCancellationRegistry = new JobCancellationRegistry();

  const tagsProcessor = new GenerateTagsProcessor(
    deps.tagRepository,
    deps.aiService,
    deps.eventBus,
    deps.logger,
    deps.noteRepository,
    jobCancellationRegistry
  );

  const tagsDispatcher = workerRegistry.register(
    'GENERATE_TAGS',
    tagsProcessor,
    deps.logger
  );

  return { tagsDispatcher, jobCanceller: jobCancellationRegistry };
}
