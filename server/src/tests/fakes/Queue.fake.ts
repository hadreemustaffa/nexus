import { vi } from 'vitest';

import Queue from '../../infrastructure/queues/Queue';

export default class FakeQueue<T> implements Queue<T> {
  enqueue = vi.fn();
  dequeue = vi.fn();
  isEmpty = vi.fn();
}
