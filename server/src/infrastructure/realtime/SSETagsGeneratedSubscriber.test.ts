import { TagFactory } from '../../tests/factories/Tag.factory';
import { FakeEventBus } from '../../tests/fakes/EventBus.fake';
import FakeSSEConnectionManager from '../../tests/fakes/SSEConnectionManager.fake';
import FakeSSEResponse from '../../tests/fakes/SSEResponse.fake';
import { buildEvent } from '../../tests/utils/buildEvent';
import SSETagsGeneratedSubscriber from './SSETagsGeneratedSubscriber';

describe('SSETagsGeneratedSubscriber', () => {
  let sseTagsGeneratedSubscriber: SSETagsGeneratedSubscriber;
  let sseConnectionManager: FakeSSEConnectionManager;
  let sseResponse: FakeSSEResponse;
  let eventBus: FakeEventBus;

  beforeEach(() => {
    sseConnectionManager = new FakeSSEConnectionManager();
    sseResponse = new FakeSSEResponse();
    eventBus = new FakeEventBus();

    sseTagsGeneratedSubscriber = new SSETagsGeneratedSubscriber(
      eventBus,
      sseConnectionManager.asConnectionManager()
    );
  });

  it('writes the SSE-formatted event + data to the matching connection', async () => {
    const tag = TagFactory.build();
    sseConnectionManager.setConnection('note-1', sseResponse.asResponse());

    sseTagsGeneratedSubscriber.subscribe();

    const event = buildEvent('NOTE_TAGS_GENERATED', {
      payload: { noteId: 'note-1', tags: [tag] },
    });

    await eventBus.emit('NOTE_TAGS_GENERATED', event);

    expect(sseResponse.write).toHaveBeenNthCalledWith(
      1,
      'event: NOTE_TAGS_GENERATED\n'
    );
    expect(sseResponse.write).toHaveBeenNthCalledWith(
      2,
      `data: ${JSON.stringify({ noteId: 'note-1', tags: event.payload.tags })}\n\n`
    );
  });

  it('does nothing when there is no connection for given noteId', async () => {
    sseTagsGeneratedSubscriber.subscribe();

    // no connection registered with the manager for the given note
    // handler should be a no-op when this event fires
    const event = buildEvent('NOTE_TAGS_GENERATED', {
      payload: { noteId: 'note-1', tags: [] },
    });

    await eventBus.emit('NOTE_TAGS_GENERATED', event);

    expect(sseConnectionManager.removeConnection).not.toHaveBeenCalled();
  });

  it('removes the connection when its socket is not writable', async () => {
    const response = sseResponse.setSocketWritable(false);
    sseConnectionManager.setConnection('note-1', response.asResponse());

    sseTagsGeneratedSubscriber.subscribe();

    const event = buildEvent('NOTE_TAGS_GENERATED', {
      payload: { noteId: 'note-1', tags: [] },
    });

    await eventBus.emit('NOTE_TAGS_GENERATED', event);

    expect(sseConnectionManager.removeConnection).toHaveBeenCalledWith(
      'note-1'
    );
    expect(response.write).not.toHaveBeenCalled();
  });

  it("does nothing when the connection's writableEnded is already true", async () => {
    const response = sseResponse.setWritableEnded(true);
    sseConnectionManager.setConnection('note-1', response.asResponse());

    sseTagsGeneratedSubscriber.subscribe();

    const event = buildEvent('NOTE_TAGS_GENERATED', {
      payload: { noteId: 'note-1', tags: [] },
    });

    await eventBus.emit('NOTE_TAGS_GENERATED', event);

    expect(response.write).not.toHaveBeenCalled();
    expect(sseConnectionManager.removeConnection).not.toHaveBeenCalled();
  });
});
