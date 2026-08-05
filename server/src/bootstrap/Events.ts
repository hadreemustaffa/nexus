import type EventBus from '../application/events/EventBus';
import Logger from '../application/ports/Logger';
import type SSEConnectionManager from '../infrastructure/realtime/SSEConnectionManager';
import SSETagsGeneratedSubscriber from '../infrastructure/realtime/SSETagsGeneratedSubscriber';

export default function setupEvents(deps: {
  eventBus: EventBus;
  sseConnectionManager: SSEConnectionManager;
  logger: Logger;
}) {
  const subscriber = new SSETagsGeneratedSubscriber(
    deps.eventBus,
    deps.sseConnectionManager,
    deps.logger
  );

  subscriber.subscribe();
}
