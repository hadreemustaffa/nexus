import EventBus, { EventHandler } from '../../application/events/EventBus';
import { EventMap } from '../../application/events/EventMap';

export class FakeEventBus implements EventBus {
  public readonly published: EventMap[keyof EventMap][] = [];
  private handlers: Partial<{
    [K in keyof EventMap]: EventHandler<K>[];
  }> = {};

  async publish<K extends keyof EventMap>(event: EventMap[K]): Promise<void> {
    this.published.push(event);
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

  async emit<K extends keyof EventMap>(
    eventType: K,
    event: EventMap[K]
  ): Promise<void> {
    const handlers = this.handlers[eventType] ?? [];
    await Promise.all(handlers.map((handler) => handler(event)));
  }
}
