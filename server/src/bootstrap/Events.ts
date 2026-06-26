import type EventBus from '../application/events/EventBus';
import type SSEConnectionManager from '../infrastructure/realtime/SSEConnectionManager';
import SSETagsGeneratedSubscriber from '../infrastructure/realtime/SSETagsGeneratedSubscriber';

export default function setupEvents(deps: {
  eventBus: EventBus;
  sseConnectionManager: SSEConnectionManager;
}) {
  const subscriber = new SSETagsGeneratedSubscriber(
    deps.eventBus,
    deps.sseConnectionManager
  );

  subscriber.subscribe();
}
