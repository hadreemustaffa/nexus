import { buildEvent } from '../../tests/utils/buildEvent';
import InMemoryEventBus from './InMemoryEventBus';

describe('InMemoryEventBus', () => {
  it('publish with no subscribers is a no-op', async () => {
    const bus = new InMemoryEventBus();
    const event = buildEvent('NOTE_TAGS_GENERATED');

    await expect(bus.publish(event)).resolves.toBeUndefined();
  });

  it('invokes a subscribed handler with the published event', async () => {
    const bus = new InMemoryEventBus();
    const handler = vi.fn();
    const event = buildEvent('NOTE_TAGS_GENERATED');

    bus.subscribe('NOTE_TAGS_GENERATED', handler);
    await bus.publish(event);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(event);
  });

  it('invokes all handlers subscribed to the same event type', async () => {
    const bus = new InMemoryEventBus();
    const handlerA = vi.fn();
    const handlerB = vi.fn();
    const event = buildEvent('NOTE_TAGS_GENERATED');

    bus.subscribe('NOTE_TAGS_GENERATED', handlerA);
    bus.subscribe('NOTE_TAGS_GENERATED', handlerB);
    await bus.publish(event);

    expect(handlerA).toHaveBeenCalledWith(event);
    expect(handlerB).toHaveBeenCalledWith(event);
  });

  it('does not invoke handlers registered for a different event type', async () => {
    const bus = new InMemoryEventBus();
    const wrongTypeHandler = vi.fn();
    const correctTypeHandler = vi.fn();

    // need to cast here since EventMap currently has only one key
    bus.subscribe('SOME_OTHER_EVENT' as any, wrongTypeHandler);
    bus.subscribe('NOTE_TAGS_GENERATED', correctTypeHandler);

    const event = buildEvent('NOTE_TAGS_GENERATED');
    await bus.publish(event);

    expect(wrongTypeHandler).not.toHaveBeenCalled();
    expect(correctTypeHandler).toHaveBeenCalledWith(event);
  });
});
