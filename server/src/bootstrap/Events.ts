import type EventBus from '../application/events/EventBus';
import type SSEConnectionManager from '../infrastructure/messaging/SSEConnectionManager';
import SSETagsGeneratedSubscriber from '../infrastructure/messaging/SSETagsGeneratedSubscriber';

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
