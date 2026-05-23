import type { EventMap } from './EventMap';

export type EventHandler<K extends keyof EventMap> = (
  event: EventMap[K]
) => Promise<void>;

export default interface EventBus {
  publish<K extends keyof EventMap>(event: EventMap[K]): Promise<void>;

  subscribe<K extends keyof EventMap>(
    eventType: K,
    handler: EventHandler<K>
  ): void;
}
