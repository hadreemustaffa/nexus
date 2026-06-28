import type EventBus from '../../application/events/EventBus';
import type { NoteTagsGeneratedEvent } from '../../domain/events/NoteTagsGeneratedEvent';
import type SSEConnectionManager from './SSEConnectionManager';

export default class SSETagsGeneratedSubscriber {
  private eventBus: EventBus;
  private sseConnectionManager: SSEConnectionManager;

  constructor(eventBus: EventBus, sseConnectionManager: SSEConnectionManager) {
    this.eventBus = eventBus;
    this.sseConnectionManager = sseConnectionManager;
  }

  subscribe(): void {
    this.eventBus.subscribe(
      'NOTE_TAGS_GENERATED',
      async (event: NoteTagsGeneratedEvent) => {
        console.log(`SSE received ${event.type} for ${event.payload.noteId}`);

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
