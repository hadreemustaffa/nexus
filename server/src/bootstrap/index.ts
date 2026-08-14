import type { Env } from '../config/env';
import { seedDefaultPrompts } from '../infrastructure/database/seeds/promptSeeds';
import type { Container } from './Container';
import setupEvents from './Events';
import setupWorkers from './Workers';

export default async function bootstrap(container: Container, env: Env) {
  setupEvents({
    eventBus: container.eventBus,
    sseConnectionManager: container.sseConnectionManager,
    logger: container.logger,
  });

  const { tagsDispatcher, jobCanceller } = setupWorkers(
    {
      noteRepository: container.noteRepository,
      tagRepository: container.tagRepository,
      aiService: container.aiService,
      eventBus: container.eventBus,
      logger: container.logger,
    },
    env.WORKER_POLL_INTERVAL_MS
  );

  container.tagsDispatcher = tagsDispatcher;
  container.jobCanceller = jobCanceller;

  const allNotes = await container.noteRepository.findAll();

  for (const note of allNotes) {
    await container.searchService.indexNote(note.getId(), note.getContent());
  }

  await seedDefaultPrompts(container.promptRepository);
}
