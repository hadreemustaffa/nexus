import type EventBus from '../../application/events/EventBus';
import type { EventHandler } from '../../application/events/EventBus';
import type { EventMap } from '../../application/events/EventMap';

export default class InMemoryEventBus implements EventBus {
  private handlers: Partial<{
    [K in keyof EventMap]: EventHandler<K>[];
  }> = {};

  async publish<K extends keyof EventMap>(event: EventMap[K]): Promise<void> {
    const handlers = this.handlers[event.type as K];

    if (!handlers) {
      return;
    }

    await Promise.all(handlers.map((handler) => handler(event)));
  }

  subscribe<K extends keyof EventMap>(
    eventType: K,
    handler: EventHandler<K>
  ): void {
    if (!this.handlers[eventType]) {
      this.handlers[eventType] = [];
    }

    this.handlers[eventType]!.push(handler);
  }
}
