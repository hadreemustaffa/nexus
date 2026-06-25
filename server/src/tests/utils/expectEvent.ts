import { EventMap } from '../../application/events/EventMap';

export function expectEvent<K extends keyof EventMap>(
  event: EventMap[keyof EventMap],
  type: K
): EventMap[K] {
  if (event.type !== type) {
    throw new Error(`expected event type "${type}", got "${event.type}"`);
  }

  return event;
}
