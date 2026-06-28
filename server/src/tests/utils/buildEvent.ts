import { EventMap } from '../../application/events/EventMap';

type EventPayload<K extends keyof EventMap> = EventMap[K]['payload'];

const defaultPayloads: {
  [K in keyof EventMap]: () => EventPayload<K>;
} = {
  NOTE_TAGS_GENERATED: () => ({ noteId: 'note-1', tags: [] }),
};

export function buildEvent<K extends keyof EventMap>(
  type: K,
  overrides: {
    occurredAt?: Date;
    payload?: Partial<EventPayload<K>>;
  } = {}
): EventMap[K] {
  return {
    type,
    occurredAt: overrides.occurredAt ?? new Date(),
    payload: {
      ...defaultPayloads[type](),
      ...overrides.payload,
    },
  };
}
