import { container } from './Container';
import setupEvents from './Events';
import setupWorkers from './Workers';

export default async function bootstrap() {
  setupEvents({
    eventBus: container.eventBus,
    sseConnectionManager: container.sseConnectionManager,
  });

  const { tagsDispatcher } = setupWorkers({
    tagRepository: container.tagRepository,
    aiService: container.aiService,
    eventBus: container.eventBus,
  });

  container.tagsDispatcher = tagsDispatcher;

  const allNotes = await container.noteRepository.findAll();

  for (const note of allNotes) {
    await container.searchService.indexNote(note.getId(), note.getContent());
  }
}
