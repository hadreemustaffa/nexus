import type EventBus from '../application/events/EventBus';
import type TagRepository from '../domain/repositories/TagRepository';
import type AIService from '../domain/services/AIService';
import GenerateTagsProcessor from '../infrastructure/ai/processors/GenerateTagsProcessor';
import WorkerRegistry from '../infrastructure/queues/WorkerRegistry';

export default function setupWorkers(
  deps: {
    tagRepository: TagRepository;
    aiService: AIService;
    eventBus: EventBus;
  },
  workerPollIntervalMs: number
) {
  const registry = new WorkerRegistry(workerPollIntervalMs);

  const tagsProcessor = new GenerateTagsProcessor(
    deps.tagRepository,
    deps.aiService,
    deps.eventBus
  );

  const tagsDispatcher = registry.register('GENERATE_TAGS', tagsProcessor);

  return { tagsDispatcher };
}
