import EventBus, { EventHandler } from '../../application/events/EventBus';
import { EventMap } from '../../application/events/EventMap';

export class FakeEventBus implements EventBus {
  public readonly published: EventMap[keyof EventMap][] = [];

  async publish<K extends keyof EventMap>(event: EventMap[K]): Promise<void> {
    this.published.push(event);
  }

  subscribe<K extends keyof EventMap>(
    _eventType: K,
    _handler: EventHandler<K>
  ): void {
    // no-op — tests assert against `published`, not handler invocation
  }
}
