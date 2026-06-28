import InMemoryQueue from './InMemoryQueue';

describe('InMemoryQueue', () => {
  let queue: InMemoryQueue<string>;

  beforeEach(() => {
    queue = new InMemoryQueue<string>();
  });

  it('enqueue/dequeue preserves FIFO order', () => {
    queue.enqueue('first');
    queue.enqueue('second');
    queue.enqueue('third');

    expect(queue.dequeue()).toBe('first');
    expect(queue.dequeue()).toBe('second');
    expect(queue.dequeue()).toBe('third');
  });

  it('dequeue on an empty queue returns undefined', () => {
    expect(queue.dequeue()).toBeUndefined();
  });

  it('isEmpty reflects current state', () => {
    expect(queue.isEmpty()).toBe(true);

    queue.enqueue('job');
    expect(queue.isEmpty()).toBe(false);

    queue.dequeue();
    expect(queue.isEmpty()).toBe(true);
  });
});
