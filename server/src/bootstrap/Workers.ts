import type EventBus from '../application/events/EventBus';
import Logger from '../application/ports/Logger';
import type TagRepository from '../domain/repositories/TagRepository';
import type AIService from '../domain/services/AIService';
import GenerateTagsProcessor from '../infrastructure/ai/processors/GenerateTagsProcessor';
import WorkerRegistry from '../infrastructure/queues/WorkerRegistry';

export default function setupWorkers(
  deps: {
    tagRepository: TagRepository;
    aiService: AIService;
    eventBus: EventBus;
    logger: Logger;
  },
  workerPollIntervalMs: number
) {
  const registry = new WorkerRegistry(workerPollIntervalMs);

  const tagsProcessor = new GenerateTagsProcessor(
    deps.tagRepository,
    deps.aiService,
    deps.eventBus,
    deps.logger
  );

  const tagsDispatcher = registry.register('GENERATE_TAGS', tagsProcessor);

  return { tagsDispatcher };
}
