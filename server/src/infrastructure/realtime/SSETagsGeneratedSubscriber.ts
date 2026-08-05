import type EventBus from '../../application/events/EventBus';
import Logger from '../../application/ports/Logger';
import type { NoteTagsGeneratedEvent } from '../../domain/events/NoteTagsGeneratedEvent';
import type SSEConnectionManager from './SSEConnectionManager';

export default class SSETagsGeneratedSubscriber {
  private eventBus: EventBus;
  private sseConnectionManager: SSEConnectionManager;
  private logger: Logger;

  constructor(
    eventBus: EventBus,
    sseConnectionManager: SSEConnectionManager,
    logger: Logger
  ) {
    this.eventBus = eventBus;
    this.sseConnectionManager = sseConnectionManager;
    this.logger = logger;
  }

  subscribe(): void {
    this.eventBus.subscribe(
      'NOTE_TAGS_GENERATED',
      async (event: NoteTagsGeneratedEvent) => {
        this.logger.info(
          {
            type: event.type,
            payload: {
              noteId: event.payload.noteId,
              tags: event.payload.tags.map((tag) => tag.getName()),
            },
          },
          'Event received'
        );

        const connection = this.sseConnectionManager.getConnection(
          event.payload.noteId
        );

        if (!connection) {
          return;
        }

        if (!connection?.socket?.writable) {
          this.sseConnectionManager.removeConnection(event.payload.noteId);

          return;
        }

        if (!connection.writableEnded) {
          connection.write(`event: NOTE_TAGS_GENERATED\n`);

          connection.write(
            `data: ${JSON.stringify({
              noteId: event.payload.noteId,
              tags: event.payload.tags,
            })}\n\n`
          );
        }
      }
    );
  }
}
